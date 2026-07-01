create table if not exists public.laundry_units_of_measure (
  id uuid primary key default gen_random_uuid(),
  code text not null,
  name text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.laundry_hospital_units (
  id uuid primary key default gen_random_uuid(),
  code text not null,
  name text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.laundry_items (
  id uuid primary key default gen_random_uuid(),
  code text not null,
  name text not null,
  item_type public.item_type not null,
  uom_id uuid not null references public.laundry_units_of_measure(id),
  notes text,
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.laundry_stock_balances (
  id uuid primary key default gen_random_uuid(),
  item_id uuid not null references public.laundry_items(id) on delete cascade,
  stock_position public.stock_position not null,
  hospital_unit_id uuid references public.laundry_hospital_units(id),
  quantity integer not null default 0 check (quantity >= 0),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.laundry_stock_movements (
  id uuid primary key default gen_random_uuid(),
  item_id uuid not null references public.laundry_items(id),
  movement_type public.movement_type not null,
  from_position public.stock_position,
  to_position public.stock_position,
  hospital_unit_id uuid references public.laundry_hospital_units(id),
  quantity integer not null check (quantity > 0),
  notes text,
  acted_by uuid,
  occurred_at timestamptz not null default timezone('utc', now()),
  created_at timestamptz not null default timezone('utc', now())
);

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'laundry_units_of_measure_code_unique'
      and conrelid = 'public.laundry_units_of_measure'::regclass
  ) then
    alter table public.laundry_units_of_measure
      add constraint laundry_units_of_measure_code_unique unique (code);
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'laundry_hospital_units_code_unique'
      and conrelid = 'public.laundry_hospital_units'::regclass
  ) then
    alter table public.laundry_hospital_units
      add constraint laundry_hospital_units_code_unique unique (code);
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'laundry_items_code_unique'
      and conrelid = 'public.laundry_items'::regclass
  ) then
    alter table public.laundry_items
      add constraint laundry_items_code_unique unique (code);
  end if;
end
$$;

create index if not exists laundry_items_uom_id_idx
  on public.laundry_items (uom_id);

create index if not exists laundry_stock_balances_item_id_idx
  on public.laundry_stock_balances (item_id);

create index if not exists laundry_stock_balances_hospital_unit_id_idx
  on public.laundry_stock_balances (hospital_unit_id);

create unique index if not exists laundry_stock_balances_item_position_unit_unique
  on public.laundry_stock_balances (
    item_id,
    stock_position,
    coalesce(hospital_unit_id, '00000000-0000-0000-0000-000000000000'::uuid)
  );

create index if not exists laundry_stock_movements_item_id_idx
  on public.laundry_stock_movements (item_id);

create index if not exists laundry_stock_movements_hospital_unit_id_idx
  on public.laundry_stock_movements (hospital_unit_id);

create index if not exists laundry_stock_movements_occurred_at_idx
  on public.laundry_stock_movements (occurred_at desc);

drop trigger if exists set_laundry_units_of_measure_updated_at on public.laundry_units_of_measure;
create trigger set_laundry_units_of_measure_updated_at
before update on public.laundry_units_of_measure
for each row
execute function public.set_updated_at();

drop trigger if exists set_laundry_hospital_units_updated_at on public.laundry_hospital_units;
create trigger set_laundry_hospital_units_updated_at
before update on public.laundry_hospital_units
for each row
execute function public.set_updated_at();

drop trigger if exists set_laundry_items_updated_at on public.laundry_items;
create trigger set_laundry_items_updated_at
before update on public.laundry_items
for each row
execute function public.set_updated_at();

drop trigger if exists set_laundry_stock_balances_updated_at on public.laundry_stock_balances;
create trigger set_laundry_stock_balances_updated_at
before update on public.laundry_stock_balances
for each row
execute function public.set_updated_at();

grant select, insert, update on public.laundry_units_of_measure to authenticated;
grant select, insert, update on public.laundry_hospital_units to authenticated;
grant select, insert, update on public.laundry_items to authenticated;
grant select, insert, update on public.laundry_stock_balances to authenticated;
grant select, insert, update on public.laundry_stock_movements to authenticated;

alter table public.laundry_units_of_measure enable row level security;
alter table public.laundry_hospital_units enable row level security;
alter table public.laundry_items enable row level security;
alter table public.laundry_stock_balances enable row level security;
alter table public.laundry_stock_movements enable row level security;

drop policy if exists "laundry_uom_select" on public.laundry_units_of_measure;
create policy "laundry_uom_select"
on public.laundry_units_of_measure
for select
to authenticated
using (public.is_laundry_role());

drop policy if exists "laundry_uom_insert" on public.laundry_units_of_measure;
create policy "laundry_uom_insert"
on public.laundry_units_of_measure
for insert
to authenticated
with check (public.is_laundry_role());

drop policy if exists "laundry_uom_update" on public.laundry_units_of_measure;
create policy "laundry_uom_update"
on public.laundry_units_of_measure
for update
to authenticated
using (public.is_laundry_role())
with check (public.is_laundry_role());

drop policy if exists "laundry_hospital_units_select" on public.laundry_hospital_units;
create policy "laundry_hospital_units_select"
on public.laundry_hospital_units
for select
to authenticated
using (public.is_laundry_role());

drop policy if exists "laundry_hospital_units_insert" on public.laundry_hospital_units;
create policy "laundry_hospital_units_insert"
on public.laundry_hospital_units
for insert
to authenticated
with check (public.is_laundry_role());

drop policy if exists "laundry_hospital_units_update" on public.laundry_hospital_units;
create policy "laundry_hospital_units_update"
on public.laundry_hospital_units
for update
to authenticated
using (public.is_laundry_role())
with check (public.is_laundry_role());

drop policy if exists "laundry_items_select" on public.laundry_items;
create policy "laundry_items_select"
on public.laundry_items
for select
to authenticated
using (public.is_laundry_role());

drop policy if exists "laundry_items_insert" on public.laundry_items;
create policy "laundry_items_insert"
on public.laundry_items
for insert
to authenticated
with check (public.is_laundry_role());

drop policy if exists "laundry_items_update" on public.laundry_items;
create policy "laundry_items_update"
on public.laundry_items
for update
to authenticated
using (public.is_laundry_role())
with check (public.is_laundry_role());

drop policy if exists "laundry_stock_balances_select" on public.laundry_stock_balances;
create policy "laundry_stock_balances_select"
on public.laundry_stock_balances
for select
to authenticated
using (public.is_laundry_role());

drop policy if exists "laundry_stock_balances_insert" on public.laundry_stock_balances;
create policy "laundry_stock_balances_insert"
on public.laundry_stock_balances
for insert
to authenticated
with check (public.is_laundry_role());

drop policy if exists "laundry_stock_balances_update" on public.laundry_stock_balances;
create policy "laundry_stock_balances_update"
on public.laundry_stock_balances
for update
to authenticated
using (public.is_laundry_role())
with check (public.is_laundry_role());

drop policy if exists "laundry_stock_movements_select" on public.laundry_stock_movements;
create policy "laundry_stock_movements_select"
on public.laundry_stock_movements
for select
to authenticated
using (public.is_laundry_role());

drop policy if exists "laundry_stock_movements_insert" on public.laundry_stock_movements;
create policy "laundry_stock_movements_insert"
on public.laundry_stock_movements
for insert
to authenticated
with check (public.is_laundry_role());

drop policy if exists "laundry_stock_movements_update" on public.laundry_stock_movements;
create policy "laundry_stock_movements_update"
on public.laundry_stock_movements
for update
to authenticated
using (public.is_laundry_role())
with check (public.is_laundry_role());
