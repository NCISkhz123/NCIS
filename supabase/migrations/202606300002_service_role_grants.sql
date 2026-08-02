grant usage on schema public to service_role;

grant select, insert, update, delete on public.profiles to service_role;
grant select, insert, update, delete on public.units_of_measure to service_role;
grant select, insert, update, delete on public.hospital_units to service_role;
grant select, insert, update, delete on public.items to service_role;
grant select, insert, update, delete on public.stock_balances to service_role;
grant select, insert, update, delete on public.stock_movements to service_role;
grant select, insert, update, delete on public.receipt_transactions to service_role;
grant select, insert, update, delete on public.receipt_transaction_lines to service_role;
grant select, insert, update, delete on public.distribution_transactions to service_role;
grant select, insert, update, delete on public.distribution_transaction_lines to service_role;
grant select, insert, update, delete on public.return_transactions to service_role;
grant select, insert, update, delete on public.return_transaction_lines to service_role;
grant select, insert, update, delete on public.internal_usage_transactions to service_role;
grant select, insert, update, delete on public.stock_opname_sessions to service_role;
grant select, insert, update, delete on public.stock_opname_lines to service_role;

grant select on public.cssd_current_stock_report_v to service_role;
grant select on public.cssd_transaction_history_report_v to service_role;
grant select on public.cssd_item_stock_card_report_v to service_role;

grant execute on function public.cssd_get_balance(uuid, public.stock_position, uuid) to service_role;
grant execute on function public.cssd_adjust_balance(uuid, public.stock_position, integer, uuid) to service_role;
grant execute on function public.cssd_receive_stock(uuid, integer, date, text, uuid) to service_role;
grant execute on function public.cssd_distribute_stock(uuid, integer, uuid, date, text, uuid) to service_role;
grant execute on function public.cssd_return_stock(uuid, integer, uuid, public.stock_position, date, text, uuid) to service_role;
grant execute on function public.cssd_transfer_reusable_stock(uuid, integer, public.stock_position, public.stock_position, date, text, uuid) to service_role;
grant execute on function public.cssd_record_internal_usage(uuid, integer, date, text, uuid) to service_role;
grant execute on function public.cssd_create_stock_opname_session(date, text, uuid) to service_role;
grant execute on function public.cssd_save_stock_opname_line(uuid, uuid, public.stock_position, uuid, integer, text, uuid) to service_role;
grant execute on function public.cssd_finalize_stock_opname_session(uuid, uuid) to service_role;
