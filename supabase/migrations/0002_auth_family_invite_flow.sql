-- =============================================================================
-- 0002_auth_family_invite_flow.sql
-- Ver ADR 0004 para el razonamiento completo.
-- =============================================================================

create policy "family_members_insert_creator" on family_members
  for insert with check (
    role = 'creator'
    and user_id = (select auth.uid())
    and exists (
      select 1 from families f
      where f.id = family_members.family_id
        and f.created_by = (select auth.uid())
    )
  );

drop policy if exists "family_invites_isolation" on family_invites;

create policy "family_invites_select_members" on family_invites
  for select using (private.is_family_member(family_id));

create policy "family_invites_insert_admins" on family_invites
  for insert with check (
    exists (
      select 1 from family_members fm
      where fm.family_id = family_invites.family_id
        and fm.user_id = (select auth.uid())
        and fm.role in ('creator', 'administrator')
        and fm.deleted_at is null
    )
  );

create or replace function public.accept_family_invite(_code text)
returns uuid as $$
declare
  _invite family_invites%rowtype;
begin
  select * into _invite
  from family_invites
  where code = _code
    and deleted_at is null
    and used_at is null
    and expires_at > now()
  for update;

  if not found then
    raise exception 'INVALID_OR_EXPIRED_INVITE';
  end if;

  insert into family_members (family_id, user_id, role, invited_by)
  values (_invite.family_id, auth.uid(), _invite.role, _invite.created_by)
  on conflict (family_id, user_id) do nothing;

  update family_invites
  set used_by = auth.uid(), used_at = now()
  where id = _invite.id
    and used_at is null;

  return _invite.family_id;
end;
$$ language plpgsql security definer set search_path = public, pg_temp;

comment on function public.accept_family_invite is 'Único punto de entrada para redimir un código de invitación. security definer acotado: valida expiración/uso, inserta family_members, marca el código usado. No expone otras operaciones.';

revoke all on function public.accept_family_invite(text) from public;
revoke execute on function public.accept_family_invite(text) from anon;
grant execute on function public.accept_family_invite(text) to authenticated;
