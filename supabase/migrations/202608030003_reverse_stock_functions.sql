create or replace function public.delete_laundry_stock_movement(
  p_movement_id uuid,
  p_actor_user_id uuid,
  p_reason text
)
returns jsonb
language plpgsql
set search_path = public
as $$
declare
  v_movement public.laundry_stock_movements%ROWTYPE;
  v_role text;
  v_hospital_unit_id uuid;
begin
  select public.current_app_role() into v_role;
  if v_role not in ('ADMIN_LAUNDRY', 'KEPALA_SEKSI') then
    raise exception 'Unauthorized to delete transactions';
  end if;

  select * into v_movement
  from public.laundry_stock_movements
  where id = p_movement_id;

  if v_movement.id is null then
    raise exception 'Movement not found';
  end if;

  insert into public.deleted_transaction_logs (
    module_name,
    transaction_type,
    original_id,
    original_data,
    deleted_by,
    reason
  ) values (
    'LAUNDRY',
    v_movement.movement_type::text,
    v_movement.id,
    row_to_json(v_movement)::jsonb,
    p_actor_user_id,
    p_reason
  );

  if v_movement.to_position is not null then
    v_hospital_unit_id := case when v_movement.to_position = 'IN_UNIT' then v_movement.hospital_unit_id else null end;
    perform public.laundry_adjust_balance(
      v_movement.item_id,
      v_movement.to_position,
      -v_movement.quantity,
      v_hospital_unit_id
    );
  end if;
  
  if v_movement.from_position is not null then
    v_hospital_unit_id := case when v_movement.from_position = 'IN_UNIT' then v_movement.hospital_unit_id else null end;
    perform public.laundry_adjust_balance(
      v_movement.item_id,
      v_movement.from_position,
      v_movement.quantity,
      v_hospital_unit_id
    );
  end if;

  delete from public.laundry_stock_movements where id = p_movement_id;

  return jsonb_build_object('success', true);
end;
$$;


create or replace function public.delete_cssd_stock_movement(
  p_movement_id uuid,
  p_actor_user_id uuid,
  p_reason text
)
returns jsonb
language plpgsql
set search_path = public
as $$
declare
  v_movement public.stock_movements%ROWTYPE;
  v_role text;
  v_hospital_unit_id uuid;
begin
  select public.current_app_role() into v_role;
  if v_role not in ('ADMIN_CSSD', 'KEPALA_SEKSI') then
    raise exception 'Unauthorized to delete transactions';
  end if;

  select * into v_movement
  from public.stock_movements
  where id = p_movement_id;

  if v_movement.id is null then
    raise exception 'Movement not found';
  end if;

  insert into public.deleted_transaction_logs (
    module_name,
    transaction_type,
    original_id,
    original_data,
    deleted_by,
    reason
  ) values (
    'CSSD',
    v_movement.movement_type::text,
    v_movement.id,
    row_to_json(v_movement)::jsonb,
    p_actor_user_id,
    p_reason
  );

  if v_movement.to_position is not null then
    v_hospital_unit_id := case when v_movement.to_position = 'IN_UNIT' then v_movement.hospital_unit_id else null end;
    perform public.cssd_adjust_balance(
      v_movement.item_id,
      v_movement.to_position,
      -v_movement.quantity,
      v_hospital_unit_id
    );
  end if;
  
  if v_movement.from_position is not null then
    v_hospital_unit_id := case when v_movement.from_position = 'IN_UNIT' then v_movement.hospital_unit_id else null end;
    perform public.cssd_adjust_balance(
      v_movement.item_id,
      v_movement.from_position,
      v_movement.quantity,
      v_hospital_unit_id
    );
  end if;

  delete from public.stock_movements where id = p_movement_id;

  return jsonb_build_object('success', true);
end;
$$;


create or replace function public.delete_ambulance_transaction(
  p_transaction_id uuid,
  p_actor_user_id uuid,
  p_reason text
)
returns jsonb
language plpgsql
set search_path = public
as $$
declare
  v_transaction public.ambulance_transactions%ROWTYPE;
  v_role text;
begin
  select public.current_app_role() into v_role;
  if v_role not in ('ADMIN_AMBULANCE', 'KEPALA_SEKSI') then
    raise exception 'Unauthorized to delete transactions';
  end if;

  select * into v_transaction
  from public.ambulance_transactions
  where id = p_transaction_id;

  if v_transaction.id is null then
    raise exception 'Transaction not found';
  end if;

  insert into public.deleted_transaction_logs (
    module_name,
    transaction_type,
    original_id,
    original_data,
    deleted_by,
    reason
  ) values (
    'AMBULANCE',
    'ORDER',
    v_transaction.id,
    row_to_json(v_transaction)::jsonb,
    p_actor_user_id,
    p_reason
  );

  -- No stock logic for ambulance, just delete it
  delete from public.ambulance_transactions where id = p_transaction_id;

  return jsonb_build_object('success', true);
end;
$$;


grant execute on function public.delete_laundry_stock_movement(uuid, uuid, text) to authenticated;
grant execute on function public.delete_cssd_stock_movement(uuid, uuid, text) to authenticated;
grant execute on function public.delete_ambulance_transaction(uuid, uuid, text) to authenticated;
