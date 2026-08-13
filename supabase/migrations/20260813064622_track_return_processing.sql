-- Add tracking columns to laundry return transaction lines
alter table public.laundry_return_transaction_lines
add column if not exists processed_to_sterilization_qty integer not null default 0,
add column if not exists processed_to_ready_qty integer not null default 0,
add column if not exists damaged_non_sterile_qty integer not null default 0,
add column if not exists damaged_sterilization_qty integer not null default 0;

-- Add tracking columns to cssd return transaction lines
alter table public.return_transaction_lines
add column if not exists processed_to_sterilization_qty integer not null default 0,
add column if not exists processed_to_ready_qty integer not null default 0,
add column if not exists damaged_non_sterile_qty integer not null default 0,
add column if not exists damaged_sterilization_qty integer not null default 0;

-- Drop and recreate laundry transfer function to accept return_line_id
drop function if exists public.laundry_transfer_reusable_stock(uuid, integer, public.stock_position, public.stock_position, date, text, uuid);

create or replace function public.laundry_transfer_reusable_stock(
  p_item_id uuid,
  p_quantity integer,
  p_from_position public.stock_position,
  p_to_position public.stock_position,
  p_occurred_at date,
  p_notes text default null,
  p_actor_user_id uuid default auth.uid(),
  p_return_line_id uuid default null
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
  from public.laundry_items
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

  -- Update tracking columns if return_line_id is provided
  if p_return_line_id is not null then
    if p_from_position = 'NON_STERILE' and p_to_position = 'STERILIZATION_AREA' then
      update public.laundry_return_transaction_lines
      set processed_to_sterilization_qty = processed_to_sterilization_qty + p_quantity
      where id = p_return_line_id;
    elsif p_from_position = 'STERILIZATION_AREA' and p_to_position = 'READY' then
      update public.laundry_return_transaction_lines
      set processed_to_ready_qty = processed_to_ready_qty + p_quantity
      where id = p_return_line_id;
    elsif p_to_position = 'DAMAGED' then
      if p_from_position = 'NON_STERILE' then
        update public.laundry_return_transaction_lines
        set damaged_non_sterile_qty = damaged_non_sterile_qty + p_quantity
        where id = p_return_line_id;
      elsif p_from_position = 'STERILIZATION_AREA' then
        update public.laundry_return_transaction_lines
        set damaged_sterilization_qty = damaged_sterilization_qty + p_quantity
        where id = p_return_line_id;
      end if;
    end if;
  end if;

  perform public.laundry_adjust_balance(
    p_item_id,
    p_from_position,
    -p_quantity,
    null
  );

  v_resulting_balance := public.laundry_adjust_balance(
    p_item_id,
    p_to_position,
    p_quantity,
    null
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
    'success', true,
    'movement_id', v_movement_id,
    'quantity', p_quantity,
    'from_position', p_from_position,
    'to_position', p_to_position,
    'resulting_balance', v_resulting_balance
  );
end;
$$;

-- Drop and recreate CSSD transfer function to accept return_line_id
drop function if exists public.cssd_transfer_reusable_stock(uuid, integer, public.stock_position, public.stock_position, date, text, uuid);

create or replace function public.cssd_transfer_reusable_stock(
  p_item_id uuid,
  p_quantity integer,
  p_from_position public.stock_position,
  p_to_position public.stock_position,
  p_occurred_at date,
  p_notes text default null,
  p_actor_user_id uuid default auth.uid(),
  p_return_line_id uuid default null
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

  -- Update tracking columns if return_line_id is provided
  if p_return_line_id is not null then
    if p_from_position = 'NON_STERILE' and p_to_position = 'STERILIZATION_AREA' then
      update public.return_transaction_lines
      set processed_to_sterilization_qty = processed_to_sterilization_qty + p_quantity
      where id = p_return_line_id;
    elsif p_from_position = 'STERILIZATION_AREA' and p_to_position = 'READY' then
      update public.return_transaction_lines
      set processed_to_ready_qty = processed_to_ready_qty + p_quantity
      where id = p_return_line_id;
    elsif p_to_position = 'DAMAGED' then
      if p_from_position = 'NON_STERILE' then
        update public.return_transaction_lines
        set damaged_non_sterile_qty = damaged_non_sterile_qty + p_quantity
        where id = p_return_line_id;
      elsif p_from_position = 'STERILIZATION_AREA' then
        update public.return_transaction_lines
        set damaged_sterilization_qty = damaged_sterilization_qty + p_quantity
        where id = p_return_line_id;
      end if;
    end if;
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
    'success', true,
    'movement_id', v_movement_id,
    'quantity', p_quantity,
    'from_position', p_from_position,
    'to_position', p_to_position,
    'resulting_balance', v_resulting_balance
  );
end;
$$;
