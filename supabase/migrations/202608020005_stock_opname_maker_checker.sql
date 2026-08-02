-- 1. Modify CSSD Stock Opname Sessions Table
alter table public.stock_opname_sessions drop constraint stock_opname_sessions_status_check;
alter table public.stock_opname_sessions add constraint stock_opname_sessions_status_check check (status in ('DRAFT', 'PENDING_APPROVAL', 'FINALIZED'));
alter table public.stock_opname_sessions add column submitted_by uuid;
alter table public.stock_opname_sessions add column submitted_at timestamptz;

-- 2. Modify Laundry Stock Opname Sessions Table
alter table public.laundry_stock_opname_sessions drop constraint laundry_stock_opname_sessions_status_check;
alter table public.laundry_stock_opname_sessions add constraint laundry_stock_opname_sessions_status_check check (status in ('DRAFT', 'PENDING_APPROVAL', 'FINALIZED'));
alter table public.laundry_stock_opname_sessions add column submitted_by uuid;
alter table public.laundry_stock_opname_sessions add column submitted_at timestamptz;

-- 3. Create CSSD Submit Function
create or replace function public.cssd_submit_stock_opname_session(
  p_session_id uuid,
  p_actor_user_id uuid default auth.uid()
)
returns jsonb
language plpgsql
set search_path = public
as $$
declare
  v_session public.stock_opname_sessions%rowtype;
begin
  select *
  into v_session
  from public.stock_opname_sessions
  where id = p_session_id;

  if v_session.id is null then
    raise exception 'stock opname session not found';
  end if;

  if v_session.status <> 'DRAFT' then
    raise exception 'stock opname session is not in DRAFT status';
  end if;

  if not exists (
    select 1
    from public.stock_opname_lines
    where stock_opname_session_id = p_session_id
  ) then
    raise exception 'stock opname session has no lines';
  end if;

  update public.stock_opname_sessions
  set
    status = 'PENDING_APPROVAL',
    submitted_by = p_actor_user_id,
    submitted_at = timezone('utc', now())
  where id = p_session_id;

  return jsonb_build_object(
    'id', p_session_id,
    'status', 'PENDING_APPROVAL'
  );
end;
$$;

-- 4. Create Laundry Submit Function
create or replace function public.laundry_submit_stock_opname_session(
  p_session_id uuid,
  p_actor_user_id uuid default auth.uid()
)
returns jsonb
language plpgsql
set search_path = public
as $$
declare
  v_session public.laundry_stock_opname_sessions%rowtype;
begin
  select *
  into v_session
  from public.laundry_stock_opname_sessions
  where id = p_session_id;

  if v_session.id is null then
    raise exception 'stock opname session not found';
  end if;

  if v_session.status <> 'DRAFT' then
    raise exception 'stock opname session is not in DRAFT status';
  end if;

  if not exists (
    select 1
    from public.laundry_stock_opname_lines
    where stock_opname_session_id = p_session_id
  ) then
    raise exception 'stock opname session has no lines';
  end if;

  update public.laundry_stock_opname_sessions
  set
    status = 'PENDING_APPROVAL',
    submitted_by = p_actor_user_id,
    submitted_at = timezone('utc', now())
  where id = p_session_id;

  return jsonb_build_object(
    'id', p_session_id,
    'status', 'PENDING_APPROVAL'
  );
end;
$$;

-- 5. Create CSSD Reject Function
create or replace function public.cssd_reject_stock_opname_session(
  p_session_id uuid,
  p_actor_user_id uuid default auth.uid()
)
returns jsonb
language plpgsql
set search_path = public
as $$
declare
  v_session public.stock_opname_sessions%rowtype;
begin
  select *
  into v_session
  from public.stock_opname_sessions
  where id = p_session_id;

  if v_session.id is null then
    raise exception 'stock opname session not found';
  end if;

  if v_session.status <> 'PENDING_APPROVAL' then
    raise exception 'stock opname session is not pending approval';
  end if;

  update public.stock_opname_sessions
  set
    status = 'DRAFT',
    submitted_by = null,
    submitted_at = null
  where id = p_session_id;

  return jsonb_build_object(
    'id', p_session_id,
    'status', 'DRAFT'
  );
end;
$$;

-- 6. Create Laundry Reject Function
create or replace function public.laundry_reject_stock_opname_session(
  p_session_id uuid,
  p_actor_user_id uuid default auth.uid()
)
returns jsonb
language plpgsql
set search_path = public
as $$
declare
  v_session public.laundry_stock_opname_sessions%rowtype;
begin
  select *
  into v_session
  from public.laundry_stock_opname_sessions
  where id = p_session_id;

  if v_session.id is null then
    raise exception 'stock opname session not found';
  end if;

  if v_session.status <> 'PENDING_APPROVAL' then
    raise exception 'stock opname session is not pending approval';
  end if;

  update public.laundry_stock_opname_sessions
  set
    status = 'DRAFT',
    submitted_by = null,
    submitted_at = null
  where id = p_session_id;

  return jsonb_build_object(
    'id', p_session_id,
    'status', 'DRAFT'
  );
end;
$$;

-- 7. Recreate CSSD Finalize Function
create or replace function public.cssd_finalize_stock_opname_session(
  p_session_id uuid,
  p_actor_user_id uuid default auth.uid()
)
returns jsonb
language plpgsql
set search_path = public
as $$
declare
  v_session public.stock_opname_sessions%rowtype;
  v_line record;
  v_current_quantity integer;
  v_delta integer;
  v_adjusted_lines integer := 0;
  v_total_variance integer := 0;
begin
  select *
  into v_session
  from public.stock_opname_sessions
  where id = p_session_id;

  if v_session.id is null then
    raise exception 'stock opname session not found';
  end if;

  if v_session.status <> 'PENDING_APPROVAL' then
    raise exception 'stock opname session is not pending approval';
  end if;

  if not exists (
    select 1
    from public.stock_opname_lines
    where stock_opname_session_id = p_session_id
  ) then
    raise exception 'stock opname session has no lines';
  end if;

  for v_line in
    select
      id,
      item_id,
      stock_position,
      hospital_unit_id,
      counted_quantity,
      notes
    from public.stock_opname_lines
    where stock_opname_session_id = p_session_id
    order by created_at asc
  loop
    v_current_quantity := public.cssd_get_balance(
      v_line.item_id,
      v_line.stock_position,
      v_line.hospital_unit_id
    );

    v_delta := v_line.counted_quantity - v_current_quantity;

    if v_delta <> 0 then
      perform public.cssd_adjust_balance(
        v_line.item_id,
        v_line.stock_position,
        v_delta,
        v_line.hospital_unit_id
      );

      insert into public.stock_movements (
        item_id,
        movement_type,
        from_position,
        to_position,
        hospital_unit_id,
        quantity,
        notes,
        acted_by,
        occurred_at
      )
      values (
        v_line.item_id,
        'ADJUSTMENT',
        case when v_delta < 0 then v_line.stock_position else null end,
        case when v_delta > 0 then v_line.stock_position else null end,
        v_line.hospital_unit_id,
        abs(v_delta),
        coalesce(
          v_line.notes,
          v_session.notes,
          'Finalisasi stock opname'
        ),
        p_actor_user_id,
        v_session.opname_date
      );

      v_adjusted_lines := v_adjusted_lines + 1;
      v_total_variance := v_total_variance + abs(v_delta);
    end if;
  end loop;

  update public.stock_opname_sessions
  set
    status = 'FINALIZED',
    finalized_by = p_actor_user_id,
    finalized_at = timezone('utc', now())
  where id = p_session_id;

  return jsonb_build_object(
    'id', p_session_id,
    'status', 'FINALIZED',
    'opname_date', v_session.opname_date,
    'adjusted_lines', v_adjusted_lines,
    'total_variance', v_total_variance
  );
end;
$$;

-- 8. Recreate Laundry Finalize Function
create or replace function public.laundry_finalize_stock_opname_session(
  p_session_id uuid,
  p_actor_user_id uuid default auth.uid()
)
returns jsonb
language plpgsql
set search_path = public
as $$
declare
  v_session public.laundry_stock_opname_sessions%rowtype;
  v_line record;
  v_current_quantity integer;
  v_delta integer;
  v_adjusted_lines integer := 0;
  v_total_variance integer := 0;
begin
  select *
  into v_session
  from public.laundry_stock_opname_sessions
  where id = p_session_id;

  if v_session.id is null then
    raise exception 'stock opname session not found';
  end if;

  if v_session.status <> 'PENDING_APPROVAL' then
    raise exception 'stock opname session is not pending approval';
  end if;

  if not exists (
    select 1
    from public.laundry_stock_opname_lines
    where stock_opname_session_id = p_session_id
  ) then
    raise exception 'stock opname session has no lines';
  end if;

  for v_line in
    select
      id,
      item_id,
      stock_position,
      hospital_unit_id,
      counted_quantity,
      notes
    from public.laundry_stock_opname_lines
    where stock_opname_session_id = p_session_id
    order by created_at asc
  loop
    v_current_quantity := public.laundry_get_balance(
      v_line.item_id,
      v_line.stock_position,
      v_line.hospital_unit_id
    );

    v_delta := v_line.counted_quantity - v_current_quantity;

    if v_delta <> 0 then
      perform public.laundry_adjust_balance(
        v_line.item_id,
        v_line.stock_position,
        v_delta,
        v_line.hospital_unit_id
      );

      insert into public.laundry_stock_movements (
        item_id,
        movement_type,
        from_position,
        to_position,
        hospital_unit_id,
        quantity,
        notes,
        acted_by,
        occurred_at
      )
      values (
        v_line.item_id,
        'ADJUSTMENT',
        case when v_delta < 0 then v_line.stock_position else null end,
        case when v_delta > 0 then v_line.stock_position else null end,
        v_line.hospital_unit_id,
        abs(v_delta),
        coalesce(
          v_line.notes,
          v_session.notes,
          'Finalisasi stock opname'
        ),
        p_actor_user_id,
        v_session.opname_date
      );

      v_adjusted_lines := v_adjusted_lines + 1;
      v_total_variance := v_total_variance + abs(v_delta);
    end if;
  end loop;

  update public.laundry_stock_opname_sessions
  set
    status = 'FINALIZED',
    finalized_by = p_actor_user_id,
    finalized_at = timezone('utc', now())
  where id = p_session_id;

  return jsonb_build_object(
    'id', p_session_id,
    'status', 'FINALIZED',
    'opname_date', v_session.opname_date,
    'adjusted_lines', v_adjusted_lines,
    'total_variance', v_total_variance
  );
end;
$$;

-- 9. Manage Permissions
revoke all on function public.cssd_submit_stock_opname_session(uuid, uuid) from public;
revoke all on function public.laundry_submit_stock_opname_session(uuid, uuid) from public;
revoke all on function public.cssd_reject_stock_opname_session(uuid, uuid) from public;
revoke all on function public.laundry_reject_stock_opname_session(uuid, uuid) from public;
revoke all on function public.cssd_finalize_stock_opname_session(uuid, uuid) from public;
revoke all on function public.laundry_finalize_stock_opname_session(uuid, uuid) from public;

grant execute on function public.cssd_submit_stock_opname_session(uuid, uuid) to authenticated, service_role;
grant execute on function public.laundry_submit_stock_opname_session(uuid, uuid) to authenticated, service_role;
grant execute on function public.cssd_reject_stock_opname_session(uuid, uuid) to authenticated, service_role;
grant execute on function public.laundry_reject_stock_opname_session(uuid, uuid) to authenticated, service_role;
grant execute on function public.cssd_finalize_stock_opname_session(uuid, uuid) to authenticated, service_role;
grant execute on function public.laundry_finalize_stock_opname_session(uuid, uuid) to authenticated, service_role;
