-- =============================================================================
-- 0001_init_core_schema.sql
-- Esquema núcleo de Family Hub: families, family_members, babies.
-- Este esquema es la base sobre la que se construirán TODOS los módulos
-- futuros (alimentación, vacunas, sueño, medicación, diario, desarrollo...).
-- Ver ADR 0002 para el patrón de RLS aplicado.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Extensión necesaria para gen_random_uuid()
-- -----------------------------------------------------------------------------
create extension if not exists "pgcrypto";

-- -----------------------------------------------------------------------------
-- Tabla: families
-- -----------------------------------------------------------------------------
create table if not exists families (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

comment on table families is 'Unidad de aislamiento (tenant) de todo el producto. Todo módulo futuro cuelga de una family_id.';

-- -----------------------------------------------------------------------------
-- Tabla: family_members
-- Roles: creator, administrator, parent, caregiver, guest
-- -----------------------------------------------------------------------------
create type family_role as enum ('creator', 'administrator', 'parent', 'caregiver', 'guest');

create table if not exists family_members (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references families(id) on delete cascade,
  user_id uuid not null references auth.users(id),
  role family_role not null default 'parent',
  invited_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  unique (family_id, user_id)
);

comment on table family_members is 'Relación usuario-familia con rol. Es la tabla que consulta is_family_member().';

-- -----------------------------------------------------------------------------
-- Tabla: family_invites
-- Invitación mediante código, según flujo Usuario -> Familia -> Invitación.
-- -----------------------------------------------------------------------------
create table if not exists family_invites (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references families(id) on delete cascade,
  code text not null unique,
  role family_role not null default 'parent',
  created_by uuid not null references auth.users(id),
  expires_at timestamptz not null default (now() + interval '7 days'),
  used_by uuid references auth.users(id),
  used_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

-- -----------------------------------------------------------------------------
-- Tabla: babies
-- due_date se usa para calcular la edad corregida en prematuros
-- (ver src/domain/baby/correctedAge.ts).
-- -----------------------------------------------------------------------------
create table if not exists babies (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references families(id) on delete cascade,
  first_name text not null,
  birth_date date not null,
  due_date date, -- null si no fue prematuro / no aplica
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

comment on column babies.due_date is 'Fecha probable de parto original. Si es anterior a birth_date, el bebé es prematuro y se debe usar edad corregida en reglas médicas.';

-- -----------------------------------------------------------------------------
-- Función núcleo de RLS (ver ADR 0002 y ADR 0003)
-- Vive en el esquema "private" (no expuesto por PostgREST) para que no sea
-- invocable directamente vía API pública, solo usable dentro de policies.
-- Toda tabla futura con family_id reutiliza esta función.
-- -----------------------------------------------------------------------------
create schema if not exists private;

create or replace function private.is_family_member(_family_id uuid)
returns boolean as $$
  select exists (
    select 1 from family_members
    where family_id = _family_id
      and user_id = auth.uid()
      and deleted_at is null
  );
$$ language sql security definer stable set search_path = public, pg_temp;

comment on function private.is_family_member is 'Punto único de verdad para el aislamiento multi-tenant. No expuesto vía API (esquema private). Usar en toda policy RLS de cualquier módulo.';

grant usage on schema private to authenticated;
grant execute on function private.is_family_member(uuid) to authenticated;

-- -----------------------------------------------------------------------------
-- RLS: families
-- -----------------------------------------------------------------------------
alter table families enable row level security;

create policy "families_select_members" on families
  for select using (private.is_family_member(id));

create policy "families_insert_own" on families
  for insert with check (created_by = (select auth.uid()));

create policy "families_update_admins" on families
  for update using (
    exists (
      select 1 from family_members
      where family_id = families.id
        and user_id = (select auth.uid())
        and role in ('creator', 'administrator')
        and deleted_at is null
    )
  );

-- -----------------------------------------------------------------------------
-- RLS: family_members
-- -----------------------------------------------------------------------------
alter table family_members enable row level security;

create policy "family_members_isolation" on family_members
  for select using (private.is_family_member(family_id));

create policy "family_members_manage_admins" on family_members
  for insert with check (
    exists (
      select 1 from family_members fm
      where fm.family_id = family_members.family_id
        and fm.user_id = (select auth.uid())
        and fm.role in ('creator', 'administrator')
        and fm.deleted_at is null
    )
  );

-- -----------------------------------------------------------------------------
-- RLS: family_invites
-- -----------------------------------------------------------------------------
alter table family_invites enable row level security;

create policy "family_invites_isolation" on family_invites
  for all using (private.is_family_member(family_id));

-- -----------------------------------------------------------------------------
-- RLS: babies (patrón estándar que reutilizará cada módulo futuro)
-- -----------------------------------------------------------------------------
alter table babies enable row level security;

create policy "babies_isolation" on babies
  for all using (private.is_family_member(family_id));

-- -----------------------------------------------------------------------------
-- Índices de cobertura para toda FK (patrón a replicar en cada módulo futuro)
-- -----------------------------------------------------------------------------
create index if not exists idx_babies_family_id on babies(family_id);
create index if not exists idx_families_created_by on families(created_by);
create index if not exists idx_family_invites_created_by on family_invites(created_by);
create index if not exists idx_family_invites_family_id on family_invites(family_id);
create index if not exists idx_family_invites_used_by on family_invites(used_by);
create index if not exists idx_family_members_invited_by on family_members(invited_by);
create index if not exists idx_family_members_user_id on family_members(user_id);

-- -----------------------------------------------------------------------------
-- Trigger genérico para mantener updated_at (reutilizable por todo módulo)
-- -----------------------------------------------------------------------------
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger families_set_updated_at before update on families
  for each row execute function set_updated_at();

create trigger family_members_set_updated_at before update on family_members
  for each row execute function set_updated_at();

create trigger family_invites_set_updated_at before update on family_invites
  for each row execute function set_updated_at();

create trigger babies_set_updated_at before update on babies
  for each row execute function set_updated_at();
