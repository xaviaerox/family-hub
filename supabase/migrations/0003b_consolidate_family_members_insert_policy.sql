-- =============================================================================
-- 0003b_consolidate_family_members_insert_policy.sql
-- Corrige el WARN de rendimiento "multiple_permissive_policies" detectado
-- al revisar advisors durante la Tarea 4: dos policies permisivas
-- separadas para el mismo INSERT en family_members se combinan en una.
-- =============================================================================

drop policy if exists "family_members_insert_creator" on family_members;
drop policy if exists "family_members_manage_admins" on family_members;

create policy "family_members_insert" on family_members
  for insert with check (
    (
      role = 'creator'
      and user_id = (select auth.uid())
      and exists (
        select 1 from families f
        where f.id = family_members.family_id
          and f.created_by = (select auth.uid())
      )
    )
    or exists (
      select 1 from family_members fm
      where fm.family_id = family_members.family_id
        and fm.user_id = (select auth.uid())
        and fm.role in ('creator', 'administrator')
        and fm.deleted_at is null
    )
  );
