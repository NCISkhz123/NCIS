create or replace view public.cssd_current_stock_report_v
with (security_invoker = true)
as
select
  sb.item_id,
  i.code as item_code,
  i.name as item_name,
  i.item_type,
  sb.stock_position,
  sb.hospital_unit_id,
  hu.code as hospital_unit_code,
  hu.name as hospital_unit_name,
  sb.quantity,
  sb.updated_at
from public.stock_balances sb
join public.items i
  on i.id = sb.item_id
left join public.hospital_units hu
  on hu.id = sb.hospital_unit_id
where sb.quantity > 0;

create or replace view public.cssd_transaction_history_report_v
with (security_invoker = true)
as
select
  sm.id as movement_id,
  sm.item_id,
  i.code as item_code,
  i.name as item_name,
  i.item_type,
  sm.movement_type,
  sm.from_position,
  sm.to_position,
  sm.hospital_unit_id,
  hu.code as hospital_unit_code,
  hu.name as hospital_unit_name,
  sm.quantity,
  sm.notes,
  sm.occurred_at,
  sm.created_at
from public.stock_movements sm
join public.items i
  on i.id = sm.item_id
left join public.hospital_units hu
  on hu.id = sm.hospital_unit_id;

create or replace view public.cssd_item_stock_card_report_v
with (security_invoker = true)
as
select
  sm.id as movement_id,
  sm.item_id,
  i.code as item_code,
  i.name as item_name,
  i.item_type,
  sm.movement_type,
  sm.from_position,
  sm.to_position,
  sm.hospital_unit_id,
  hu.code as hospital_unit_code,
  hu.name as hospital_unit_name,
  sm.quantity,
  sm.notes,
  sm.occurred_at,
  sm.created_at
from public.stock_movements sm
join public.items i
  on i.id = sm.item_id
left join public.hospital_units hu
  on hu.id = sm.hospital_unit_id;

grant select on public.cssd_current_stock_report_v to authenticated;
grant select on public.cssd_transaction_history_report_v to authenticated;
grant select on public.cssd_item_stock_card_report_v to authenticated;
