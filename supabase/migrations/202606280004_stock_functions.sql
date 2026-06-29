create or replace function public.cssd_get_balance(
  p_item_id uuid,
  p_stock_position public.stock_position,
  p_hospital_unit_id uuid default null
)
returns integer
language sql
stable
set search_path = public
as $$
  select coalesce((
    select quantity
    from public.stock_balances
    where item_id = p_item_id
      and stock_position = p_stock_position
      and (
        (p_hospital_unit_id is null and hospital_unit_id is null)
        or hospital_unit_id = p_hospital_unit_id
      )
    limit 1
  ), 0);
$$;

create or replace function public.cssd_adjust_balance(
  p_item_id uuid,
  p_stock_position public.stock_position,
  p_delta integer,
  p_hospital_unit_id uuid default null
)
returns integer
language plpgsql
set search_path = public
as $$
declare
  v_balance_id uuid;
  v_current_quantity integer;
  v_new_quantity integer;
begin
  select id, quantity
  into v_balance_id, v_current_quantity
  from public.stock_balances
  where item_id = p_item_id
    and stock_position = p_stock_position
    and (
      (p_hospital_unit_id is null and hospital_unit_id is null)
      or hospital_unit_id = p_hospital_unit_id
    )
  limit 1
  for update;

  if v_balance_id is null then
    if p_delta < 0 then
      raise exception 'insufficient stock for item % in position %', p_item_id, p_stock_position;
    end if;

    insert into public.stock_balances (
      item_id,
      stock_position,
      hospital_unit_id,
      quantity
    )
    values (
      p_item_id,
      p_stock_position,
      p_hospital_unit_id,
      p_delta
    );

    return p_delta;
  end if;

  v_new_quantity := v_current_quantity + p_delta;

  if v_new_quantity < 0 then
    raise exception 'insufficient stock for item % in position %', p_item_id, p_stock_position;
  end if;

  update public.stock_balances
  set quantity = v_new_quantity
  where id = v_balance_id;

  return v_new_quantity;
end;
$$;

create or replace function public.cssd_receive_stock(
  p_item_id uuid,
  p_quantity integer,
  p_occurred_at date,
  p_notes text default null,
  p_actor_user_id uuid default auth.uid()
)
returns jsonb
language plpgsql
set search_path = public
as $$
declare
  v_item_type public.item_type;
  v_transaction_id uuid;
  v_movement_id uuid;
  v_resulting_balance integer;
begin
  select item_type
  into v_item_type
  from public.items
  where id = p_item_id;

  if v_item_type is null then
    raise exception 'item not found';
  end if;

  insert into public.receipt_transactions (
    received_at,
    notes,
    created_by
  )
  values (
    p_occurred_at,
    p_notes,
    p_actor_user_id
  )
  returning id into v_transaction_id;

  insert into public.receipt_transaction_lines (
    receipt_transaction_id,
    item_id,
    quantity,
    notes
  )
  values (
    v_transaction_id,
    p_item_id,
    p_quantity,
    p_notes
  );

  v_resulting_balance := public.cssd_adjust_balance(
    p_item_id,
    'READY',
    p_quantity,
    null
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
    p_item_id,
    'RECEIPT',
    null,
    'READY',
    null,
    p_quantity,
    p_notes,
    p_actor_user_id,
    p_occurred_at
  )
  returning id into v_movement_id;

  return jsonb_build_object(
    'transaction_id', v_transaction_id,
    'movement_id', v_movement_id,
    'item_id', p_item_id,
    'item_type', v_item_type,
    'quantity', p_quantity,
    'from_position', null,
    'to_position', 'READY',
    'hospital_unit_id', null,
    'resulting_balance', v_resulting_balance
  );
end;
$$;

create or replace function public.cssd_distribute_stock(
  p_item_id uuid,
  p_quantity integer,
  p_target_unit_id uuid,
  p_occurred_at date,
  p_notes text default null,
  p_actor_user_id uuid default auth.uid()
)
returns jsonb
language plpgsql
set search_path = public
as $$
declare
  v_item_type public.item_type;
  v_transaction_id uuid;
  v_movement_id uuid;
  v_origin_balance integer;
  v_destination_balance integer;
  v_to_position public.stock_position;
begin
  select item_type
  into v_item_type
  from public.items
  where id = p_item_id;

  if v_item_type is null then
    raise exception 'item not found';
  end if;

  if v_item_type = 'CONSUMABLE_INTERNAL' then
    raise exception 'distribution only supports reusable or consumable distribution items';
  end if;

  insert into public.distribution_transactions (
    distributed_at,
    target_unit_id,
    notes,
    created_by
  )
  values (
    p_occurred_at,
    p_target_unit_id,
    p_notes,
    p_actor_user_id
  )
  returning id into v_transaction_id;

  insert into public.distribution_transaction_lines (
    distribution_transaction_id,
    item_id,
    quantity,
    notes
  )
  values (
    v_transaction_id,
    p_item_id,
    p_quantity,
    p_notes
  );

  v_origin_balance := public.cssd_adjust_balance(
    p_item_id,
    'READY',
    -p_quantity,
    null
  );

  if v_item_type = 'REUSABLE' then
    v_destination_balance := public.cssd_adjust_balance(
      p_item_id,
      'IN_UNIT',
      p_quantity,
      p_target_unit_id
    );
    v_to_position := 'IN_UNIT';
  else
    v_destination_balance := v_origin_balance;
    v_to_position := null;
  end if;

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
    p_item_id,
    'DISTRIBUTION',
    'READY',
    v_to_position,
    p_target_unit_id,
    p_quantity,
    p_notes,
    p_actor_user_id,
    p_occurred_at
  )
  returning id into v_movement_id;

  return jsonb_build_object(
    'transaction_id', v_transaction_id,
    'movement_id', v_movement_id,
    'item_id', p_item_id,
    'item_type', v_item_type,
    'quantity', p_quantity,
    'from_position', 'READY',
    'to_position', v_to_position,
    'hospital_unit_id', p_target_unit_id,
    'resulting_balance', v_destination_balance
  );
end;
$$;

create or replace function public.cssd_return_stock(
  p_item_id uuid,
  p_quantity integer,
  p_source_unit_id uuid,
  p_destination_position public.stock_position,
  p_occurred_at date,
  p_notes text default null,
  p_actor_user_id uuid default auth.uid()
)
returns jsonb
language plpgsql
set search_path = public
as $$
declare
  v_item_type public.item_type;
  v_transaction_id uuid;
  v_movement_id uuid;
  v_resulting_balance integer;
begin
  select item_type
  into v_item_type
  from public.items
  where id = p_item_id;

  if v_item_type is null then
    raise exception 'item not found';
  end if;

  if v_item_type <> 'REUSABLE' then
    raise exception 'return only supports reusable items';
  end if;

  if p_destination_position not in ('NON_STERILE', 'DAMAGED') then
    raise exception 'invalid return destination';
  end if;

  insert into public.return_transactions (
    returned_at,
    source_unit_id,
    notes,
    created_by
  )
  values (
    p_occurred_at,
    p_source_unit_id,
    p_notes,
    p_actor_user_id
  )
  returning id into v_transaction_id;

  insert into public.return_transaction_lines (
    return_transaction_id,
    item_id,
    quantity,
    destination_position,
    notes
  )
  values (
    v_transaction_id,
    p_item_id,
    p_quantity,
    p_destination_position,
    p_notes
  );

  perform public.cssd_adjust_balance(
    p_item_id,
    'IN_UNIT',
    -p_quantity,
    p_source_unit_id
  );

  v_resulting_balance := public.cssd_adjust_balance(
    p_item_id,
    p_destination_position,
    p_quantity,
    null
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
    p_item_id,
    'RETURN',
    'IN_UNIT',
    p_destination_position,
    p_source_unit_id,
    p_quantity,
    p_notes,
    p_actor_user_id,
    p_occurred_at
  )
  returning id into v_movement_id;

  return jsonb_build_object(
    'transaction_id', v_transaction_id,
    'movement_id', v_movement_id,
    'item_id', p_item_id,
    'item_type', v_item_type,
    'quantity', p_quantity,
    'from_position', 'IN_UNIT',
    'to_position', p_destination_position,
    'hospital_unit_id', p_source_unit_id,
    'resulting_balance', v_resulting_balance
  );
end;
$$;

create or replace function public.cssd_transfer_reusable_stock(
  p_item_id uuid,
  p_quantity integer,
  p_from_position public.stock_position,
  p_to_position public.stock_position,
  p_occurred_at date,
  p_notes text default null,
  p_actor_user_id uuid default auth.uid()
)
returns jsonb
language plpgsql
set search_path = public
as $$
declare
  v_item_type public.item_type;
  v_movement_id uuid;
  v_resulting_balance integer;
begin
  select item_type
  into v_item_type
  from public.items
  where id = p_item_id;

  if v_item_type is null then
    raise exception 'item not found';
  end if;

  if v_item_type <> 'REUSABLE' then
    raise exception 'reusable transfer only supports reusable items';
  end if;

  if not (
    (p_from_position = 'NON_STERILE' and p_to_position = 'STERILIZATION_AREA')
    or (p_from_position = 'STERILIZATION_AREA' and p_to_position = 'READY')
    or p_to_position = 'DAMAGED'
  ) then
    raise exception 'invalid reusable transfer flow';
  end if;

  perform public.cssd_adjust_balance(
    p_item_id,
    p_from_position,
    -p_quantity,
    null
  );

  v_resulting_balance := public.cssd_adjust_balance(
    p_item_id,
    p_to_position,
    p_quantity,
    null
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
    p_item_id,
    'REUSABLE_TRANSFER',
    p_from_position,
    p_to_position,
    null,
    p_quantity,
    p_notes,
    p_actor_user_id,
    p_occurred_at
  )
  returning id into v_movement_id;

  return jsonb_build_object(
    'transaction_id', null,
    'movement_id', v_movement_id,
    'item_id', p_item_id,
    'item_type', v_item_type,
    'quantity', p_quantity,
    'from_position', p_from_position,
    'to_position', p_to_position,
    'hospital_unit_id', null,
    'resulting_balance', v_resulting_balance
  );
end;
$$;

create or replace function public.cssd_record_internal_usage(
  p_item_id uuid,
  p_quantity integer,
  p_occurred_at date,
  p_notes text default null,
  p_actor_user_id uuid default auth.uid()
)
returns jsonb
language plpgsql
set search_path = public
as $$
declare
  v_item_type public.item_type;
  v_transaction_id uuid;
  v_movement_id uuid;
  v_resulting_balance integer;
begin
  select item_type
  into v_item_type
  from public.items
  where id = p_item_id;

  if v_item_type is null then
    raise exception 'item not found';
  end if;

  if v_item_type <> 'CONSUMABLE_INTERNAL' then
    raise exception 'internal usage only supports consumable internal items';
  end if;

  insert into public.internal_usage_transactions (
    used_at,
    item_id,
    quantity,
    notes,
    created_by
  )
  values (
    p_occurred_at,
    p_item_id,
    p_quantity,
    p_notes,
    p_actor_user_id
  )
  returning id into v_transaction_id;

  v_resulting_balance := public.cssd_adjust_balance(
    p_item_id,
    'READY',
    -p_quantity,
    null
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
    p_item_id,
    'INTERNAL_USAGE',
    'READY',
    null,
    null,
    p_quantity,
    p_notes,
    p_actor_user_id,
    p_occurred_at
  )
  returning id into v_movement_id;

  return jsonb_build_object(
    'transaction_id', v_transaction_id,
    'movement_id', v_movement_id,
    'item_id', p_item_id,
    'item_type', v_item_type,
    'quantity', p_quantity,
    'from_position', 'READY',
    'to_position', null,
    'hospital_unit_id', null,
    'resulting_balance', v_resulting_balance
  );
end;
$$;

revoke all on function public.cssd_get_balance(uuid, public.stock_position, uuid) from public;
revoke all on function public.cssd_adjust_balance(uuid, public.stock_position, integer, uuid) from public;
revoke all on function public.cssd_receive_stock(uuid, integer, date, text, uuid) from public;
revoke all on function public.cssd_distribute_stock(uuid, integer, uuid, date, text, uuid) from public;
revoke all on function public.cssd_return_stock(uuid, integer, uuid, public.stock_position, date, text, uuid) from public;
revoke all on function public.cssd_transfer_reusable_stock(uuid, integer, public.stock_position, public.stock_position, date, text, uuid) from public;
revoke all on function public.cssd_record_internal_usage(uuid, integer, date, text, uuid) from public;

grant execute on function public.cssd_get_balance(uuid, public.stock_position, uuid) to authenticated;
grant execute on function public.cssd_adjust_balance(uuid, public.stock_position, integer, uuid) to authenticated;
grant execute on function public.cssd_receive_stock(uuid, integer, date, text, uuid) to authenticated;
grant execute on function public.cssd_distribute_stock(uuid, integer, uuid, date, text, uuid) to authenticated;
grant execute on function public.cssd_return_stock(uuid, integer, uuid, public.stock_position, date, text, uuid) to authenticated;
grant execute on function public.cssd_transfer_reusable_stock(uuid, integer, public.stock_position, public.stock_position, date, text, uuid) to authenticated;
grant execute on function public.cssd_record_internal_usage(uuid, integer, date, text, uuid) to authenticated;
