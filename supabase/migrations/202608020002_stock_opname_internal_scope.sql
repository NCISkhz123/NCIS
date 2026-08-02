-- Migration: 202608020002_stock_opname_internal_scope.sql

alter table public.stock_opname_sessions
  add column if not exists scope_type text not null default 'GLOBAL' check (scope_type in ('GLOBAL', 'INTERNAL', 'UNIT'));

alter table public.laundry_stock_opname_sessions
  add column if not exists scope_type text not null default 'GLOBAL' check (scope_type in ('GLOBAL', 'INTERNAL', 'UNIT'));

-- CSSD RPC create session update with scope_type
create or replace function public.cssd_create_stock_opname_session(
  p_opname_date date,
  p_notes text default null,
  p_hospital_unit_id uuid default null,
  p_scope_type text default 'GLOBAL',
  p_actor_user_id uuid default auth.uid()
)
returns jsonb
language plpgsql
set search_path = public
as $$
declare
  v_existing_draft_id uuid;
  v_session_id uuid;
  v_effective_unit_id uuid;
  v_effective_scope text;
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

  v_effective_scope := coalesce(p_scope_type, 'GLOBAL');
  if v_effective_scope not in ('GLOBAL', 'INTERNAL', 'UNIT') then
    raise exception 'invalid scope type';
  end if;

  if v_effective_scope = 'UNIT' and p_hospital_unit_id is null then
    raise exception 'hospital unit is required for UNIT scope';
  end if;

  if v_effective_scope = 'UNIT' then
    v_effective_unit_id := p_hospital_unit_id;
  else
    v_effective_unit_id := null;
  end if;

  insert into public.stock_opname_sessions (
    opname_date,
    status,
    notes,
    scope_type,
    hospital_unit_id,
    created_by
  )
  values (
    p_opname_date,
    'DRAFT',
    p_notes,
    v_effective_scope,
    v_effective_unit_id,
    p_actor_user_id
  )
  returning id into v_session_id;

  return jsonb_build_object(
    'id', v_session_id,
    'status', 'DRAFT',
    'opname_date', p_opname_date,
    'notes', p_notes,
    'scope_type', v_effective_scope,
    'hospital_unit_id', v_effective_unit_id,
    'line_count', 0
  );
end;
$$;

-- Laundry RPC create session update with scope_type
create or replace function public.laundry_create_stock_opname_session(
  p_opname_date date,
  p_notes text default null,
  p_hospital_unit_id uuid default null,
  p_scope_type text default 'GLOBAL',
  p_actor_user_id uuid default auth.uid()
)
returns jsonb
language plpgsql
set search_path = public
as $$
declare
  v_existing_draft_id uuid;
  v_session_id uuid;
  v_effective_unit_id uuid;
  v_effective_scope text;
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

  v_effective_scope := coalesce(p_scope_type, 'GLOBAL');
  if v_effective_scope not in ('GLOBAL', 'INTERNAL', 'UNIT') then
    raise exception 'invalid scope type';
  end if;

  if v_effective_scope = 'UNIT' and p_hospital_unit_id is null then
    raise exception 'hospital unit is required for UNIT scope';
  end if;

  if v_effective_scope = 'UNIT' then
    v_effective_unit_id := p_hospital_unit_id;
  else
    v_effective_unit_id := null;
  end if;

  insert into public.laundry_stock_opname_sessions (
    opname_date,
    status,
    notes,
    scope_type,
    hospital_unit_id,
    created_by
  )
  values (
    p_opname_date,
    'DRAFT',
    p_notes,
    v_effective_scope,
    v_effective_unit_id,
    p_actor_user_id
  )
  returning id into v_session_id;

  return jsonb_build_object(
    'id', v_session_id,
    'status', 'DRAFT',
    'opname_date', p_opname_date,
    'notes', p_notes,
    'scope_type', v_effective_scope,
    'hospital_unit_id', v_effective_unit_id,
    'line_count', 0
  );
end;
$$;
