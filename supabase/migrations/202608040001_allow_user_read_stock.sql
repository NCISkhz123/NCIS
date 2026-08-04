-- Add RLS select policies for USER role on CSSD and Laundry tables to allow read-only access to stock.

-- CSSD Tables
create policy "cssd_items_select_user"
on public.items
for select
to authenticated
using (public.current_app_role() = 'USER');

create policy "cssd_stock_balances_select_user"
on public.stock_balances
for select
to authenticated
using (public.current_app_role() = 'USER');

create policy "cssd_stock_movements_select_user"
on public.stock_movements
for select
to authenticated
using (public.current_app_role() = 'USER');

create policy "cssd_units_of_measure_select_user"
on public.units_of_measure
for select
to authenticated
using (public.current_app_role() = 'USER');

create policy "cssd_hospital_units_select_user"
on public.hospital_units
for select
to authenticated
using (public.current_app_role() = 'USER');

-- Laundry Tables
create policy "laundry_items_select_user"
on public.laundry_items
for select
to authenticated
using (public.current_app_role() = 'USER');

create policy "laundry_stock_balances_select_user"
on public.laundry_stock_balances
for select
to authenticated
using (public.current_app_role() = 'USER');

create policy "laundry_stock_movements_select_user"
on public.laundry_stock_movements
for select
to authenticated
using (public.current_app_role() = 'USER');

create policy "laundry_units_of_measure_select_user"
on public.laundry_units_of_measure
for select
to authenticated
using (public.current_app_role() = 'USER');

create policy "laundry_hospital_units_select_user"
on public.laundry_hospital_units
for select
to authenticated
using (public.current_app_role() = 'USER');
