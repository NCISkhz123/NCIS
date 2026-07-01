grant all on public.laundry_units_of_measure to service_role;
grant all on public.laundry_hospital_units to service_role;
grant all on public.laundry_items to service_role;
grant all on public.laundry_stock_balances to service_role;
grant all on public.laundry_stock_movements to service_role;
grant all on public.laundry_receipt_transactions to service_role;
grant all on public.laundry_receipt_transaction_lines to service_role;
grant all on public.laundry_distribution_transactions to service_role;
grant all on public.laundry_distribution_transaction_lines to service_role;
grant all on public.laundry_return_transactions to service_role;
grant all on public.laundry_return_transaction_lines to service_role;
grant all on public.laundry_internal_usage_transactions to service_role;
grant all on public.laundry_stock_opname_sessions to service_role;
grant all on public.laundry_stock_opname_lines to service_role;

grant execute on function public.laundry_get_balance(uuid, public.stock_position, uuid) to service_role;
grant execute on function public.laundry_adjust_balance(uuid, public.stock_position, integer, uuid) to service_role;
grant execute on function public.laundry_receive_stock(uuid, integer, date, text, uuid) to service_role;
grant execute on function public.laundry_distribute_stock(uuid, integer, uuid, date, text, uuid) to service_role;
grant execute on function public.laundry_return_stock(uuid, integer, uuid, public.stock_position, date, text, uuid) to service_role;
grant execute on function public.laundry_transfer_reusable_stock(uuid, integer, public.stock_position, public.stock_position, date, text, uuid) to service_role;
grant execute on function public.laundry_record_internal_usage(uuid, integer, date, text, uuid) to service_role;
grant execute on function public.laundry_create_stock_opname_session(date, text, uuid) to service_role;
grant execute on function public.laundry_save_stock_opname_line(uuid, uuid, public.stock_position, uuid, integer, text, uuid) to service_role;
grant execute on function public.laundry_finalize_stock_opname_session(uuid, uuid) to service_role;

grant select on public.laundry_current_stock_report_v to service_role;
grant select on public.laundry_transaction_history_report_v to service_role;
grant select on public.laundry_item_stock_card_report_v to service_role;
