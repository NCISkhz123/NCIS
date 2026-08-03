create table if not exists public.deleted_transaction_logs (
  id uuid primary key default gen_random_uuid(),
  module_name text not null,
  transaction_type text not null,
  original_id uuid not null,
  original_data jsonb not null,
  deleted_by uuid not null,
  deleted_at timestamptz not null default timezone('utc', now()),
  reason text
);

create index if not exists deleted_transaction_logs_module_name_idx
  on public.deleted_transaction_logs (module_name);

grant select, insert on public.deleted_transaction_logs to authenticated;

alter table public.deleted_transaction_logs enable row level security;

drop policy if exists "deleted_transaction_logs_select_superadmin" on public.deleted_transaction_logs;
create policy "deleted_transaction_logs_select_superadmin"
on public.deleted_transaction_logs
for select
to authenticated
using (public.current_app_role() = 'KEPALA_SEKSI');

drop policy if exists "deleted_transaction_logs_insert" on public.deleted_transaction_logs;
create policy "deleted_transaction_logs_insert"
on public.deleted_transaction_logs
for insert
to authenticated
with check (public.current_app_role() in (
  'ADMIN_CSSD', 'ADMIN_LAUNDRY', 'ADMIN_AMBULANCE', 'KEPALA_SEKSI'
));
