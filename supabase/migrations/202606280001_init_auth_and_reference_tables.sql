create extension if not exists pgcrypto;

do $$
begin
  if not exists (
    select 1
    from pg_type
    where typnamespace = 'public'::regnamespace
      and typname = 'app_role'
  ) then
    create type public.app_role as enum ('ADMIN_CSSD', 'PETUGAS_CSSD', 'USER');
  end if;

  if not exists (
    select 1
    from pg_type
    where typnamespace = 'public'::regnamespace
      and typname = 'item_type'
  ) then
    create type public.item_type as enum (
      'REUSABLE',
      'CONSUMABLE_DISTRIBUTION',
      'CONSUMABLE_INTERNAL'
    );
  end if;
end
$$;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create or replace function public.current_app_role()
returns text
language sql
stable
as $$
  select coalesce(
    auth.jwt() -> 'app_metadata' ->> 'role',
    auth.jwt() -> 'user_metadata' ->> 'role',
    'USER'
  );
$$;

create or replace function public.is_cssd_role()
returns boolean
language sql
stable
as $$
  select public.current_app_role() in ('ADMIN_CSSD', 'PETUGAS_CSSD');
$$;

create table if not exists public.profiles (
  user_id uuid primary key,
  email text,
  full_name text,
  app_role public.app_role not null default 'USER',
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.units_of_measure (
  id uuid primary key default gen_random_uuid(),
  code text not null,
  name text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.hospital_units (
  id uuid primary key default gen_random_uuid(),
  code text not null,
  name text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.items (
  id uuid primary key default gen_random_uuid(),
  code text not null,
  name text not null,
  item_type public.item_type not null,
  uom_id uuid not null references public.units_of_measure(id),
  notes text,
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'profiles_email_unique'
      and conrelid = 'public.profiles'::regclass
  ) then
    alter table public.profiles
      add constraint profiles_email_unique unique (email);
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'units_of_measure_code_unique'
      and conrelid = 'public.units_of_measure'::regclass
  ) then
    alter table public.units_of_measure
      add constraint units_of_measure_code_unique unique (code);
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'hospital_units_code_unique'
      and conrelid = 'public.hospital_units'::regclass
  ) then
    alter table public.hospital_units
      add constraint hospital_units_code_unique unique (code);
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'items_code_unique'
      and conrelid = 'public.items'::regclass
  ) then
    alter table public.items
      add constraint items_code_unique unique (code);
  end if;
end
$$;

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
before update on public.profiles
for each row
execute function public.set_updated_at();

drop trigger if exists set_units_of_measure_updated_at on public.units_of_measure;
create trigger set_units_of_measure_updated_at
before update on public.units_of_measure
for each row
execute function public.set_updated_at();

drop trigger if exists set_hospital_units_updated_at on public.hospital_units;
create trigger set_hospital_units_updated_at
before update on public.hospital_units
for each row
execute function public.set_updated_at();

drop trigger if exists set_items_updated_at on public.items;
create trigger set_items_updated_at
before update on public.items
for each row
execute function public.set_updated_at();

grant usage on schema public to authenticated;
grant select, insert, update on public.profiles to authenticated;
grant select, insert, update on public.units_of_measure to authenticated;
grant select, insert, update on public.hospital_units to authenticated;
grant select, insert, update on public.items to authenticated;

alter table public.profiles enable row level security;
alter table public.units_of_measure enable row level security;
alter table public.hospital_units enable row level security;
alter table public.items enable row level security;

drop policy if exists "cssd_profiles_select" on public.profiles;
create policy "cssd_profiles_select"
on public.profiles
for select
to authenticated
using (public.is_cssd_role());

drop policy if exists "cssd_profiles_insert" on public.profiles;
create policy "cssd_profiles_insert"
on public.profiles
for insert
to authenticated
with check (public.is_cssd_role());

drop policy if exists "cssd_profiles_update" on public.profiles;
create policy "cssd_profiles_update"
on public.profiles
for update
to authenticated
using (public.is_cssd_role())
with check (public.is_cssd_role());

drop policy if exists "cssd_uom_select" on public.units_of_measure;
create policy "cssd_uom_select"
on public.units_of_measure
for select
to authenticated
using (public.is_cssd_role());

drop policy if exists "cssd_uom_insert" on public.units_of_measure;
create policy "cssd_uom_insert"
on public.units_of_measure
for insert
to authenticated
with check (public.is_cssd_role());

drop policy if exists "cssd_uom_update" on public.units_of_measure;
create policy "cssd_uom_update"
on public.units_of_measure
for update
to authenticated
using (public.is_cssd_role())
with check (public.is_cssd_role());

drop policy if exists "cssd_hospital_units_select" on public.hospital_units;
create policy "cssd_hospital_units_select"
on public.hospital_units
for select
to authenticated
using (public.is_cssd_role());

drop policy if exists "cssd_hospital_units_insert" on public.hospital_units;
create policy "cssd_hospital_units_insert"
on public.hospital_units
for insert
to authenticated
with check (public.is_cssd_role());

drop policy if exists "cssd_hospital_units_update" on public.hospital_units;
create policy "cssd_hospital_units_update"
on public.hospital_units
for update
to authenticated
using (public.is_cssd_role())
with check (public.is_cssd_role());

drop policy if exists "cssd_items_select" on public.items;
create policy "cssd_items_select"
on public.items
for select
to authenticated
using (public.is_cssd_role());

drop policy if exists "cssd_items_insert" on public.items;
create policy "cssd_items_insert"
on public.items
for insert
to authenticated
with check (public.is_cssd_role());

drop policy if exists "cssd_items_update" on public.items;
create policy "cssd_items_update"
on public.items
for update
to authenticated
using (public.is_cssd_role())
with check (public.is_cssd_role());
