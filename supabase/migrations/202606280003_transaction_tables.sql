create table if not exists public.receipt_transactions (
  id uuid primary key default gen_random_uuid(),
  reference_no text,
  received_at date not null default current_date,
  notes text,
  created_by uuid,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.receipt_transaction_lines (
  id uuid primary key default gen_random_uuid(),
  receipt_transaction_id uuid not null references public.receipt_transactions(id) on delete cascade,
  item_id uuid not null references public.items(id),
  quantity integer not null check (quantity > 0),
  notes text,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.distribution_transactions (
  id uuid primary key default gen_random_uuid(),
  reference_no text,
  distributed_at date not null default current_date,
  target_unit_id uuid not null references public.hospital_units(id),
  notes text,
  created_by uuid,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.distribution_transaction_lines (
  id uuid primary key default gen_random_uuid(),
  distribution_transaction_id uuid not null references public.distribution_transactions(id) on delete cascade,
  item_id uuid not null references public.items(id),
  quantity integer not null check (quantity > 0),
  notes text,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.return_transactions (
  id uuid primary key default gen_random_uuid(),
  reference_no text,
  returned_at date not null default current_date,
  source_unit_id uuid not null references public.hospital_units(id),
  notes text,
  created_by uuid,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.return_transaction_lines (
  id uuid primary key default gen_random_uuid(),
  return_transaction_id uuid not null references public.return_transactions(id) on delete cascade,
  item_id uuid not null references public.items(id),
  quantity integer not null check (quantity > 0),
  destination_position public.stock_position not null,
  notes text,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.internal_usage_transactions (
  id uuid primary key default gen_random_uuid(),
  used_at date not null default current_date,
  item_id uuid not null references public.items(id),
  quantity integer not null check (quantity > 0),
  notes text,
  created_by uuid,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.stock_opname_sessions (
  id uuid primary key default gen_random_uuid(),
  opname_date date not null default current_date,
  status text not null default 'DRAFT' check (status in ('DRAFT', 'FINALIZED')),
  notes text,
  created_by uuid,
  finalized_by uuid,
  finalized_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.stock_opname_lines (
  id uuid primary key default gen_random_uuid(),
  stock_opname_session_id uuid not null references public.stock_opname_sessions(id) on delete cascade,
  item_id uuid not null references public.items(id),
  stock_position public.stock_position not null,
  hospital_unit_id uuid references public.hospital_units(id),
  counted_quantity integer not null check (counted_quantity >= 0),
  notes text,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists receipt_transaction_lines_receipt_transaction_id_idx
  on public.receipt_transaction_lines (receipt_transaction_id);

create index if not exists receipt_transaction_lines_item_id_idx
  on public.receipt_transaction_lines (item_id);

create index if not exists distribution_transactions_target_unit_id_idx
  on public.distribution_transactions (target_unit_id);

create index if not exists distribution_transaction_lines_distribution_transaction_id_idx
  on public.distribution_transaction_lines (distribution_transaction_id);

create index if not exists distribution_transaction_lines_item_id_idx
  on public.distribution_transaction_lines (item_id);

create index if not exists return_transactions_source_unit_id_idx
  on public.return_transactions (source_unit_id);

create index if not exists return_transaction_lines_return_transaction_id_idx
  on public.return_transaction_lines (return_transaction_id);

create index if not exists return_transaction_lines_item_id_idx
  on public.return_transaction_lines (item_id);

create index if not exists internal_usage_transactions_item_id_idx
  on public.internal_usage_transactions (item_id);

create index if not exists stock_opname_lines_stock_opname_session_id_idx
  on public.stock_opname_lines (stock_opname_session_id);

create index if not exists stock_opname_lines_item_id_idx
  on public.stock_opname_lines (item_id);

drop trigger if exists set_receipt_transactions_updated_at on public.receipt_transactions;
create trigger set_receipt_transactions_updated_at
before update on public.receipt_transactions
for each row
execute function public.set_updated_at();

drop trigger if exists set_distribution_transactions_updated_at on public.distribution_transactions;
create trigger set_distribution_transactions_updated_at
before update on public.distribution_transactions
for each row
execute function public.set_updated_at();

drop trigger if exists set_return_transactions_updated_at on public.return_transactions;
create trigger set_return_transactions_updated_at
before update on public.return_transactions
for each row
execute function public.set_updated_at();

drop trigger if exists set_internal_usage_transactions_updated_at on public.internal_usage_transactions;
create trigger set_internal_usage_transactions_updated_at
before update on public.internal_usage_transactions
for each row
execute function public.set_updated_at();

drop trigger if exists set_stock_opname_sessions_updated_at on public.stock_opname_sessions;
create trigger set_stock_opname_sessions_updated_at
before update on public.stock_opname_sessions
for each row
execute function public.set_updated_at();

grant select, insert, update on public.receipt_transactions to authenticated;
grant select, insert, update on public.receipt_transaction_lines to authenticated;
grant select, insert, update on public.distribution_transactions to authenticated;
grant select, insert, update on public.distribution_transaction_lines to authenticated;
grant select, insert, update on public.return_transactions to authenticated;
grant select, insert, update on public.return_transaction_lines to authenticated;
grant select, insert, update on public.internal_usage_transactions to authenticated;
grant select, insert, update on public.stock_opname_sessions to authenticated;
grant select, insert, update on public.stock_opname_lines to authenticated;

alter table public.receipt_transactions enable row level security;
alter table public.receipt_transaction_lines enable row level security;
alter table public.distribution_transactions enable row level security;
alter table public.distribution_transaction_lines enable row level security;
alter table public.return_transactions enable row level security;
alter table public.return_transaction_lines enable row level security;
alter table public.internal_usage_transactions enable row level security;
alter table public.stock_opname_sessions enable row level security;
alter table public.stock_opname_lines enable row level security;

drop policy if exists "cssd_receipt_transactions_select" on public.receipt_transactions;
create policy "cssd_receipt_transactions_select"
on public.receipt_transactions
for select
to authenticated
using (public.is_cssd_role());

drop policy if exists "cssd_receipt_transactions_insert" on public.receipt_transactions;
create policy "cssd_receipt_transactions_insert"
on public.receipt_transactions
for insert
to authenticated
with check (public.is_cssd_role());

drop policy if exists "cssd_receipt_transactions_update" on public.receipt_transactions;
create policy "cssd_receipt_transactions_update"
on public.receipt_transactions
for update
to authenticated
using (public.is_cssd_role())
with check (public.is_cssd_role());

drop policy if exists "cssd_receipt_transaction_lines_select" on public.receipt_transaction_lines;
create policy "cssd_receipt_transaction_lines_select"
on public.receipt_transaction_lines
for select
to authenticated
using (public.is_cssd_role());

drop policy if exists "cssd_receipt_transaction_lines_insert" on public.receipt_transaction_lines;
create policy "cssd_receipt_transaction_lines_insert"
on public.receipt_transaction_lines
for insert
to authenticated
with check (public.is_cssd_role());

drop policy if exists "cssd_receipt_transaction_lines_update" on public.receipt_transaction_lines;
create policy "cssd_receipt_transaction_lines_update"
on public.receipt_transaction_lines
for update
to authenticated
using (public.is_cssd_role())
with check (public.is_cssd_role());

drop policy if exists "cssd_distribution_transactions_select" on public.distribution_transactions;
create policy "cssd_distribution_transactions_select"
on public.distribution_transactions
for select
to authenticated
using (public.is_cssd_role());

drop policy if exists "cssd_distribution_transactions_insert" on public.distribution_transactions;
create policy "cssd_distribution_transactions_insert"
on public.distribution_transactions
for insert
to authenticated
with check (public.is_cssd_role());

drop policy if exists "cssd_distribution_transactions_update" on public.distribution_transactions;
create policy "cssd_distribution_transactions_update"
on public.distribution_transactions
for update
to authenticated
using (public.is_cssd_role())
with check (public.is_cssd_role());

drop policy if exists "cssd_distribution_transaction_lines_select" on public.distribution_transaction_lines;
create policy "cssd_distribution_transaction_lines_select"
on public.distribution_transaction_lines
for select
to authenticated
using (public.is_cssd_role());

drop policy if exists "cssd_distribution_transaction_lines_insert" on public.distribution_transaction_lines;
create policy "cssd_distribution_transaction_lines_insert"
on public.distribution_transaction_lines
for insert
to authenticated
with check (public.is_cssd_role());

drop policy if exists "cssd_distribution_transaction_lines_update" on public.distribution_transaction_lines;
create policy "cssd_distribution_transaction_lines_update"
on public.distribution_transaction_lines
for update
to authenticated
using (public.is_cssd_role())
with check (public.is_cssd_role());

drop policy if exists "cssd_return_transactions_select" on public.return_transactions;
create policy "cssd_return_transactions_select"
on public.return_transactions
for select
to authenticated
using (public.is_cssd_role());

drop policy if exists "cssd_return_transactions_insert" on public.return_transactions;
create policy "cssd_return_transactions_insert"
on public.return_transactions
for insert
to authenticated
with check (public.is_cssd_role());

drop policy if exists "cssd_return_transactions_update" on public.return_transactions;
create policy "cssd_return_transactions_update"
on public.return_transactions
for update
to authenticated
using (public.is_cssd_role())
with check (public.is_cssd_role());

drop policy if exists "cssd_return_transaction_lines_select" on public.return_transaction_lines;
create policy "cssd_return_transaction_lines_select"
on public.return_transaction_lines
for select
to authenticated
using (public.is_cssd_role());

drop policy if exists "cssd_return_transaction_lines_insert" on public.return_transaction_lines;
create policy "cssd_return_transaction_lines_insert"
on public.return_transaction_lines
for insert
to authenticated
with check (public.is_cssd_role());

drop policy if exists "cssd_return_transaction_lines_update" on public.return_transaction_lines;
create policy "cssd_return_transaction_lines_update"
on public.return_transaction_lines
for update
to authenticated
using (public.is_cssd_role())
with check (public.is_cssd_role());

drop policy if exists "cssd_internal_usage_transactions_select" on public.internal_usage_transactions;
create policy "cssd_internal_usage_transactions_select"
on public.internal_usage_transactions
for select
to authenticated
using (public.is_cssd_role());

drop policy if exists "cssd_internal_usage_transactions_insert" on public.internal_usage_transactions;
create policy "cssd_internal_usage_transactions_insert"
on public.internal_usage_transactions
for insert
to authenticated
with check (public.is_cssd_role());

drop policy if exists "cssd_internal_usage_transactions_update" on public.internal_usage_transactions;
create policy "cssd_internal_usage_transactions_update"
on public.internal_usage_transactions
for update
to authenticated
using (public.is_cssd_role())
with check (public.is_cssd_role());

drop policy if exists "cssd_stock_opname_sessions_select" on public.stock_opname_sessions;
create policy "cssd_stock_opname_sessions_select"
on public.stock_opname_sessions
for select
to authenticated
using (public.is_cssd_role());

drop policy if exists "cssd_stock_opname_sessions_insert" on public.stock_opname_sessions;
create policy "cssd_stock_opname_sessions_insert"
on public.stock_opname_sessions
for insert
to authenticated
with check (public.is_cssd_role());

drop policy if exists "cssd_stock_opname_sessions_update" on public.stock_opname_sessions;
create policy "cssd_stock_opname_sessions_update"
on public.stock_opname_sessions
for update
to authenticated
using (public.is_cssd_role())
with check (public.is_cssd_role());

drop policy if exists "cssd_stock_opname_lines_select" on public.stock_opname_lines;
create policy "cssd_stock_opname_lines_select"
on public.stock_opname_lines
for select
to authenticated
using (public.is_cssd_role());

drop policy if exists "cssd_stock_opname_lines_insert" on public.stock_opname_lines;
create policy "cssd_stock_opname_lines_insert"
on public.stock_opname_lines
for insert
to authenticated
with check (public.is_cssd_role());

drop policy if exists "cssd_stock_opname_lines_update" on public.stock_opname_lines;
create policy "cssd_stock_opname_lines_update"
on public.stock_opname_lines
for update
to authenticated
using (public.is_cssd_role())
with check (public.is_cssd_role());
