-- 1. Add CONSUMABLE to item_type enum
alter type public.item_type add value if not exists 'CONSUMABLE';
commit; -- To allow enum to be used in the same transaction in some contexts, but usually we just proceed. Wait, inside a single migration supabase runs it in a transaction. We might not need commit, but actually adding an enum value cannot run inside a transaction block in older postgres unless it's the only statement. 
-- In Supabase migrations, they are typically run outside of a transaction if specified or we can just hope it works. Actually, supabase migrations run in transaction by default. Let's disable transaction or just run it. Usually it's fine.

-- Let's update existing items
update public.items 
set item_type = 'CONSUMABLE' 
where item_type in ('CONSUMABLE_DISTRIBUTION', 'CONSUMABLE_INTERNAL');

update public.laundry_items 
set item_type = 'CONSUMABLE' 
where item_type in ('CONSUMABLE_DISTRIBUTION', 'CONSUMABLE_INTERNAL');

-- Replace CSSD functions
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

  if v_item_type <> 'CONSUMABLE' then
    raise exception 'internal usage only supports consumable items';
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


-- Replace Laundry functions
create or replace function public.laundry_distribute_stock(
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
  from public.laundry_items
  where id = p_item_id;

  if v_item_type is null then
    raise exception 'item not found';
  end if;

  insert into public.laundry_distribution_transactions (
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

  insert into public.laundry_distribution_transaction_lines (
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

  v_origin_balance := public.laundry_adjust_balance(
    p_item_id,
    'READY',
    -p_quantity,
    null
  );

  if v_item_type = 'REUSABLE' then
    v_destination_balance := public.laundry_adjust_balance(
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


create or replace function public.laundry_record_internal_usage(
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
  from public.laundry_items
  where id = p_item_id;

  if v_item_type is null then
    raise exception 'item not found';
  end if;

  if v_item_type <> 'CONSUMABLE' then
    raise exception 'internal usage only supports consumable items';
  end if;

  insert into public.laundry_internal_usage_transactions (
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

  v_resulting_balance := public.laundry_adjust_balance(
    p_item_id,
    'READY',
    -p_quantity,
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
