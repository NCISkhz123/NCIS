-- Migration: 202608020001_stock_opname_unit_scope.sql

alter table public.stock_opname_sessions
  add column if not exists hospital_unit_id uuid references public.hospital_units(id) on delete set null;

alter table public.laundry_stock_opname_sessions
  add column if not exists hospital_unit_id uuid references public.laundry_hospital_units(id) on delete set null;

-- Drop old function signatures to prevent overload ambiguity
drop function if exists public.cssd_create_stock_opname_session(date, text, uuid);
drop function if exists public.laundry_create_stock_opname_session(date, text, uuid);

-- CSSD RPC create session update
create or replace function public.cssd_create_stock_opname_session(
  p_opname_date date,
  p_notes text default null,
  p_hospital_unit_id uuid default null,
  p_actor_user_id uuid default auth.uid()
)
returns jsonb
language plpgsql
set search_path = public
as $$
declare
  v_existing_draft_id uuid;
  v_session_id uuid;
begin
  select id
  into v_existing_draft_id
  from public.stock_opname_sessions
  where status = 'DRAFT'
  order by created_at desc
  limit 1;

  if v_existing_draft_id is not null then
    raise exception 'draft stock opname session already exists';
  end if;

  insert into public.stock_opname_sessions (
    opname_date,
    status,
    notes,
    hospital_unit_id,
    created_by
  )
  values (
    p_opname_date,
    'DRAFT',
    p_notes,
    p_hospital_unit_id,
    p_actor_user_id
  )
  returning id into v_session_id;

  return jsonb_build_object(
    'id', v_session_id,
    'status', 'DRAFT',
    'opname_date', p_opname_date,
    'notes', p_notes,
    'hospital_unit_id', p_hospital_unit_id,
    'line_count', 0
  );
end;
$$;

-- Laundry RPC create session update
create or replace function public.laundry_create_stock_opname_session(
  p_opname_date date,
  p_notes text default null,
  p_hospital_unit_id uuid default null,
  p_actor_user_id uuid default auth.uid()
)
returns jsonb
language plpgsql
set search_path = public
as $$
declare
  v_existing_draft_id uuid;
  v_session_id uuid;
begin
  select id
  into v_existing_draft_id
  from public.laundry_stock_opname_sessions
  where status = 'DRAFT'
  order by created_at desc
  limit 1;

  if v_existing_draft_id is not null then
    raise exception 'draft stock opname session already exists';
  end if;

  insert into public.laundry_stock_opname_sessions (
    opname_date,
    status,
    notes,
    hospital_unit_id,
    created_by
  )
  values (
    p_opname_date,
    'DRAFT',
    p_notes,
    p_hospital_unit_id,
    p_actor_user_id
  )
  returning id into v_session_id;

  return jsonb_build_object(
    'id', v_session_id,
    'status', 'DRAFT',
    'opname_date', p_opname_date,
    'notes', p_notes,
    'hospital_unit_id', p_hospital_unit_id,
    'line_count', 0
  );
end;
$$;

-- Grants & Permissions
revoke all on function public.cssd_create_stock_opname_session(date, text, uuid, uuid) from public;
grant execute on function public.cssd_create_stock_opname_session(date, text, uuid, uuid) to authenticated;
grant execute on function public.cssd_create_stock_opname_session(date, text, uuid, uuid) to service_role;

revoke all on function public.laundry_create_stock_opname_session(date, text, uuid, uuid) from public;
grant execute on function public.laundry_create_stock_opname_session(date, text, uuid, uuid) to authenticated;
grant execute on function public.laundry_create_stock_opname_session(date, text, uuid, uuid) to service_role;
