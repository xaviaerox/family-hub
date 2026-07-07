-- =============================================================================
-- 0003_feeding_module_schema.sql
-- Ver comentarios en el propio esquema aplicado (Tarea 4).
-- =============================================================================

create table if not exists allergens (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  source_id text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists food_items (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null,
  min_age_days integer not null,
  source_id text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

comment on column food_items.min_age_days is 'Edad mínima recomendada en días, calculada sobre edad corregida cuando el bebé es prematuro.';

create table if not exists food_allergens (
  food_item_id uuid not null references food_items(id) on delete cascade,
  allergen_id uuid not null references allergens(id) on delete cascade,
  primary key (food_item_id, allergen_id)
);

create type reaction_severity as enum ('none', 'mild', 'moderate', 'severe');

create table if not exists feeding_events (
  id uuid primary key default gen_random_uuid(),
  baby_id uuid not null references babies(id) on delete cascade,
  food_item_id uuid not null references food_items(id),
  occurred_at timestamptz not null default now(),
  reaction reaction_severity not null default 'none',
  notes text,
  photo_url text,
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

alter table allergens enable row level security;
create policy "allergens_read_authenticated" on allergens
  for select using ((select auth.uid()) is not null);

alter table food_items enable row level security;
create policy "food_items_read_authenticated" on food_items
  for select using ((select auth.uid()) is not null);

alter table food_allergens enable row level security;
create policy "food_allergens_read_authenticated" on food_allergens
  for select using ((select auth.uid()) is not null);

alter table feeding_events enable row level security;

create policy "feeding_events_isolation" on feeding_events
  for all using (
    private.is_family_member((select family_id from babies where babies.id = feeding_events.baby_id))
  );

create index if not exists idx_food_allergens_allergen_id on food_allergens(allergen_id);
create index if not exists idx_feeding_events_baby_id on feeding_events(baby_id);
create index if not exists idx_feeding_events_food_item_id on feeding_events(food_item_id);
create index if not exists idx_feeding_events_created_by on feeding_events(created_by);
create index if not exists idx_feeding_events_baby_occurred on feeding_events(baby_id, occurred_at desc);

create trigger food_items_set_updated_at before update on food_items
  for each row execute function set_updated_at();

create trigger allergens_set_updated_at before update on allergens
  for each row execute function set_updated_at();

create trigger feeding_events_set_updated_at before update on feeding_events
  for each row execute function set_updated_at();
