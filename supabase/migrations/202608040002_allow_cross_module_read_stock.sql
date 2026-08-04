-- Drop previous USER policies
drop policy if exists "cssd_items_select_user" on public.items;
drop policy if exists "cssd_stock_balances_select_user" on public.stock_balances;
drop policy if exists "cssd_stock_movements_select_user" on public.stock_movements;
drop policy if exists "cssd_units_of_measure_select_user" on public.units_of_measure;
drop policy if exists "cssd_hospital_units_select_user" on public.hospital_units;

drop policy if exists "laundry_items_select_user" on laundry.items;
drop policy if exists "laundry_stock_balances_select_user" on laundry.stock_balances;
drop policy if exists "laundry_stock_movements_select_user" on laundry.stock_movements;
drop policy if exists "laundry_units_of_measure_select_user" on laundry.units_of_measure;
drop policy if exists "laundry_hospital_units_select_user" on laundry.hospital_units;

-- Create global cross-module read-only policies for all valid app roles
-- CSSD Tables
create policy "cssd_items_select_cross_module"
on public.items
for select
to authenticated
using (public.current_app_role() is not null);

create policy "cssd_stock_balances_select_cross_module"
on public.stock_balances
for select
to authenticated
using (public.current_app_role() is not null);

create policy "cssd_stock_movements_select_cross_module"
on public.stock_movements
for select
to authenticated
using (public.current_app_role() is not null);

create policy "cssd_units_of_measure_select_cross_module"
on public.units_of_measure
for select
to authenticated
using (public.current_app_role() is not null);

create policy "cssd_hospital_units_select_cross_module"
on public.hospital_units
for select
to authenticated
using (public.current_app_role() is not null);

-- Laundry Tables
create policy "laundry_items_select_cross_module"
on laundry.items
for select
to authenticated
using (public.current_app_role() is not null);

create policy "laundry_stock_balances_select_cross_module"
on laundry.stock_balances
for select
to authenticated
using (public.current_app_role() is not null);

create policy "laundry_stock_movements_select_cross_module"
on laundry.stock_movements
for select
to authenticated
using (public.current_app_role() is not null);

create policy "laundry_units_of_measure_select_cross_module"
on laundry.units_of_measure
for select
to authenticated
using (public.current_app_role() is not null);

create policy "laundry_hospital_units_select_cross_module"
on laundry.hospital_units
for select
to authenticated
using (public.current_app_role() is not null);
