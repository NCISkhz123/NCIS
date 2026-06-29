do $$
begin
  if not exists (
    select 1
    from pg_type
    where typnamespace = 'public'::regnamespace
      and typname = 'stock_position'
  ) then
    create type public.stock_position as enum (
      'READY',
      'IN_UNIT',
      'NON_STERILE',
      'STERILIZATION_AREA',
      'DAMAGED'
    );
  end if;

  if not exists (
    select 1
    from pg_type
    where typnamespace = 'public'::regnamespace
      and typname = 'movement_type'
  ) then
    create type public.movement_type as enum (
      'RECEIPT',
      'DISTRIBUTION',
      'RETURN',
      'REUSABLE_TRANSFER',
      'INTERNAL_USAGE',
      'STOCK_OPNAME',
      'ADJUSTMENT'
    );
  end if;
end
$$;

create table if not exists public.stock_balances (
  id uuid primary key default gen_random_uuid(),
  item_id uuid not null references public.items(id) on delete cascade,
  stock_position public.stock_position not null,
  hospital_unit_id uuid references public.hospital_units(id),
  quantity integer not null default 0 check (quantity >= 0),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.stock_movements (
  id uuid primary key default gen_random_uuid(),
  item_id uuid not null references public.items(id),
  movement_type public.movement_type not null,
  from_position public.stock_position,
  to_position public.stock_position,
  hospital_unit_id uuid references public.hospital_units(id),
  quantity integer not null check (quantity > 0),
  notes text,
  acted_by uuid,
  occurred_at timestamptz not null default timezone('utc', now()),
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists stock_balances_item_id_idx
  on public.stock_balances (item_id);

create index if not exists stock_balances_hospital_unit_id_idx
  on public.stock_balances (hospital_unit_id);

create unique index if not exists stock_balances_item_position_unit_unique
  on public.stock_balances (
    item_id,
    stock_position,
    coalesce(hospital_unit_id, '00000000-0000-0000-0000-000000000000'::uuid)
  );

create index if not exists stock_movements_item_id_idx
  on public.stock_movements (item_id);

create index if not exists stock_movements_hospital_unit_id_idx
  on public.stock_movements (hospital_unit_id);

create index if not exists stock_movements_occurred_at_idx
  on public.stock_movements (occurred_at desc);

drop trigger if exists set_stock_balances_updated_at on public.stock_balances;
create trigger set_stock_balances_updated_at
before update on public.stock_balances
for each row
execute function public.set_updated_at();

grant select, insert, update on public.stock_balances to authenticated;
grant select, insert, update on public.stock_movements to authenticated;

alter table public.stock_balances enable row level security;
alter table public.stock_movements enable row level security;

drop policy if exists "cssd_stock_balances_select" on public.stock_balances;
create policy "cssd_stock_balances_select"
on public.stock_balances
for select
to authenticated
using (public.is_cssd_role());

drop policy if exists "cssd_stock_balances_insert" on public.stock_balances;
create policy "cssd_stock_balances_insert"
on public.stock_balances
for insert
to authenticated
with check (public.is_cssd_role());

drop policy if exists "cssd_stock_balances_update" on public.stock_balances;
create policy "cssd_stock_balances_update"
on public.stock_balances
for update
to authenticated
using (public.is_cssd_role())
with check (public.is_cssd_role());

drop policy if exists "cssd_stock_movements_select" on public.stock_movements;
create policy "cssd_stock_movements_select"
on public.stock_movements
for select
to authenticated
using (public.is_cssd_role());

drop policy if exists "cssd_stock_movements_insert" on public.stock_movements;
create policy "cssd_stock_movements_insert"
on public.stock_movements
for insert
to authenticated
with check (public.is_cssd_role());

drop policy if exists "cssd_stock_movements_update" on public.stock_movements;
create policy "cssd_stock_movements_update"
on public.stock_movements
for update
to authenticated
using (public.is_cssd_role())
with check (public.is_cssd_role());
