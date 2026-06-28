# NCIS CSSD MVP Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the first production-ready NCIS module for CSSD, covering master data, stock movements, core transactions, and reports without a dashboard.

**Architecture:** Use a single Next.js App Router application with Supabase Auth and Postgres as the system of record. Keep stock-changing business rules in Postgres-backed transaction functions so stock balances and stock movements stay atomic, while Next.js server actions and route segments handle UI, validation, and role-aware access.

**Tech Stack:** Next.js, TypeScript, shadcn/ui, Tailwind CSS, Supabase Auth, Supabase Postgres, Zod, React Hook Form, Vitest, Testing Library

---

## Assumptions Locked For This Plan

- Phase 1 only ships the CSSD module.
- There is no dashboard in MVP.
- Auth roles are `ADMIN_CSSD` and `PETUGAS_CSSD`.
- `Master Data` contains `Item`, `Satuan`, and `Unit`.
- `Item` types are `REUSABLE`, `CONSUMABLE_DISTRIBUTION`, and `CONSUMABLE_INTERNAL`.
- Reusable stock positions are `READY`, `IN_UNIT`, `NON_STERILE`, `STERILIZATION_AREA`, and `DAMAGED`.
- Consumable distribution is recorded against the target unit but is not tracked as active unit stock.
- Consumable internal usage is recorded as `item + qty + tanggal + keterangan`.
- Internal reusable transitions are implemented as actions inside the CSSD flow, not as a separate top-level menu.

## Spec Reference

- Source design: `docs/superpowers/specs/2026-06-28-ncis-cssd-mvp-design.md`

## File Map

### Foundation and Tooling

- Create: `.gitignore`
- Create: `.env.example`
- Create: `package.json`
- Create: `pnpm-lock.yaml`
- Create: `next.config.ts`
- Create: `tsconfig.json`
- Create: `postcss.config.mjs`
- Create: `eslint.config.mjs`
- Create: `components.json`
- Create: `middleware.ts`

### Supabase and Database

- Create: `supabase/config.toml`
- Create: `supabase/seed.sql`
- Create: `supabase/migrations/202606280001_init_auth_and_reference_tables.sql`
- Create: `supabase/migrations/202606280002_stock_core.sql`
- Create: `supabase/migrations/202606280003_transaction_tables.sql`
- Create: `supabase/migrations/202606280004_stock_functions.sql`
- Create: `supabase/migrations/202606280005_reporting_views.sql`

### App Shell and Shared Libraries

- Create: `src/app/layout.tsx`
- Create: `src/app/globals.css`
- Create: `src/app/(auth)/login/page.tsx`
- Create: `src/app/(protected)/layout.tsx`
- Create: `src/app/(protected)/cssd/layout.tsx`
- Create: `src/components/layout/app-sidebar.tsx`
- Create: `src/components/layout/module-header.tsx`
- Create: `src/components/layout/sidebar-nav.tsx`
- Create: `src/components/forms/form-error.tsx`
- Create: `src/components/data/data-table.tsx`
- Create: `src/components/data/empty-state.tsx`
- Create: `src/lib/env.ts`
- Create: `src/lib/utils.ts`
- Create: `src/lib/auth/roles.ts`
- Create: `src/lib/auth/guards.ts`
- Create: `src/lib/auth/profile.ts`
- Create: `src/lib/supabase/server.ts`
- Create: `src/lib/supabase/client.ts`
- Create: `src/lib/supabase/middleware.ts`

### CSSD Domain

- Create: `src/lib/cssd/constants.ts`
- Create: `src/lib/cssd/types.ts`
- Create: `src/lib/cssd/codegen/item-code.ts`
- Create: `src/lib/cssd/validators/item.ts`
- Create: `src/lib/cssd/validators/uom.ts`
- Create: `src/lib/cssd/validators/unit.ts`
- Create: `src/lib/cssd/validators/receipt.ts`
- Create: `src/lib/cssd/validators/distribution.ts`
- Create: `src/lib/cssd/validators/return.ts`
- Create: `src/lib/cssd/validators/internal-usage.ts`
- Create: `src/lib/cssd/validators/reusable-transfer.ts`
- Create: `src/lib/cssd/validators/stock-opname.ts`
- Create: `src/lib/cssd/services/master-data.ts`
- Create: `src/lib/cssd/services/stock.ts`
- Create: `src/lib/cssd/services/receipts.ts`
- Create: `src/lib/cssd/services/distributions.ts`
- Create: `src/lib/cssd/services/returns.ts`
- Create: `src/lib/cssd/services/internal-usages.ts`
- Create: `src/lib/cssd/services/reusable-transfers.ts`
- Create: `src/lib/cssd/services/stock-opname.ts`
- Create: `src/lib/cssd/services/reports.ts`

### CSSD Routes

- Create: `src/app/(protected)/cssd/master-data/items/page.tsx`
- Create: `src/app/(protected)/cssd/master-data/items/actions.ts`
- Create: `src/app/(protected)/cssd/master-data/satuan/page.tsx`
- Create: `src/app/(protected)/cssd/master-data/satuan/actions.ts`
- Create: `src/app/(protected)/cssd/master-data/unit/page.tsx`
- Create: `src/app/(protected)/cssd/master-data/unit/actions.ts`
- Create: `src/app/(protected)/cssd/pemasukan/page.tsx`
- Create: `src/app/(protected)/cssd/pemasukan/actions.ts`
- Create: `src/app/(protected)/cssd/distribusi/page.tsx`
- Create: `src/app/(protected)/cssd/distribusi/actions.ts`
- Create: `src/app/(protected)/cssd/pengembalian/page.tsx`
- Create: `src/app/(protected)/cssd/pengembalian/actions.ts`
- Create: `src/app/(protected)/cssd/pemakaian-internal/page.tsx`
- Create: `src/app/(protected)/cssd/pemakaian-internal/actions.ts`
- Create: `src/app/(protected)/cssd/stok-opname/page.tsx`
- Create: `src/app/(protected)/cssd/stok-opname/actions.ts`
- Create: `src/app/(protected)/cssd/laporan/page.tsx`

### Tests

- Create: `tests/setup.ts`
- Create: `tests/unit/lib/cssd/codegen/item-code.test.ts`
- Create: `tests/unit/lib/cssd/validators/item.test.ts`
- Create: `tests/unit/lib/cssd/validators/transactions.test.ts`
- Create: `tests/integration/auth/guards.test.ts`
- Create: `tests/integration/cssd/master-data.test.ts`
- Create: `tests/integration/cssd/receipts.test.ts`
- Create: `tests/integration/cssd/distributions.test.ts`
- Create: `tests/integration/cssd/returns.test.ts`
- Create: `tests/integration/cssd/reusable-transfers.test.ts`
- Create: `tests/integration/cssd/internal-usages.test.ts`
- Create: `tests/integration/cssd/stock-opname.test.ts`
- Create: `tests/integration/cssd/reports.test.ts`

## Chunk 1: Project Foundation

### Task 1: Bootstrap the application and local developer tooling

**Files:**
- Create: `.gitignore`
- Create: `.env.example`
- Create: `package.json`
- Create: `pnpm-lock.yaml`
- Create: `next.config.ts`
- Create: `tsconfig.json`
- Create: `postcss.config.mjs`
- Create: `eslint.config.mjs`
- Create: `src/app/layout.tsx`
- Create: `src/app/globals.css`

- [ ] **Step 1: Scaffold the Next.js app with the App Router**

Run:

```bash
pnpm dlx create-next-app@latest . --ts --eslint --tailwind --app --src-dir --use-pnpm --import-alias "@/*" --no-git
```

Expected: Next.js app files are created in the current repository without replacing `.git`.

- [ ] **Step 2: Install domain and testing dependencies**

Run:

```bash
pnpm add @supabase/supabase-js @supabase/ssr zod react-hook-form @hookform/resolvers date-fns
pnpm add -D supabase vitest @vitest/coverage-v8 @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom
```

Expected: package manager completes without version conflicts.

- [ ] **Step 3: Write the baseline scripts and ignore rules**

Add scripts for:

- `dev`
- `build`
- `start`
- `lint`
- `typecheck`
- `test:unit`
- `test:integration`
- `test`

Ensure `.gitignore` includes at least:

- `.next/`
- `node_modules/`
- `.env*`
- `.superpowers/`
- `coverage/`

- [ ] **Step 4: Run the baseline quality checks**

Run:

```bash
pnpm lint
pnpm exec tsc --noEmit
```

Expected: both commands pass on the fresh scaffold.

- [ ] **Step 5: Commit the bootstrap**

```bash
git add .
git commit -m "chore: scaffold nextjs app foundation"
```

### Task 2: Configure Supabase local development and authenticated app shell

**Files:**
- Create: `supabase/config.toml`
- Create: `supabase/seed.sql`
- Create: `.env.example`
- Create: `middleware.ts`
- Create: `src/app/(auth)/login/page.tsx`
- Create: `src/app/(protected)/layout.tsx`
- Create: `src/lib/env.ts`
- Create: `src/lib/auth/roles.ts`
- Create: `src/lib/auth/guards.ts`
- Create: `src/lib/auth/profile.ts`
- Create: `src/lib/supabase/server.ts`
- Create: `src/lib/supabase/client.ts`
- Create: `src/lib/supabase/middleware.ts`
- Test: `tests/integration/auth/guards.test.ts`

- [ ] **Step 1: Write the failing auth guard test**

Cover at least:

- unauthenticated users redirect to `/login`
- authenticated users without CSSD role are denied
- authenticated `ADMIN_CSSD` and `PETUGAS_CSSD` users can access `/cssd/*`

- [ ] **Step 2: Run the auth guard test to verify failure**

Run:

```bash
pnpm vitest run tests/integration/auth/guards.test.ts
```

Expected: FAIL because auth helpers and middleware do not exist yet.

- [ ] **Step 3: Implement environment parsing, Supabase clients, middleware, and protected layout**

Requirements:

- parse `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- centralize role constants
- read the signed-in profile on the server
- redirect non-authenticated access to `/login`
- keep the protected layout thin and reusable for future modules

- [ ] **Step 4: Run the auth guard test again**

Run:

```bash
pnpm vitest run tests/integration/auth/guards.test.ts
```

Expected: PASS.

- [ ] **Step 5: Commit the auth shell**

```bash
git add .
git commit -m "feat: add supabase auth shell and guards"
```

### Task 3: Create database schema, RLS policies, and seed data

**Files:**
- Create: `supabase/migrations/202606280001_init_auth_and_reference_tables.sql`
- Create: `supabase/migrations/202606280002_stock_core.sql`
- Create: `supabase/migrations/202606280003_transaction_tables.sql`
- Create: `supabase/seed.sql`
- Test: `tests/integration/cssd/master-data.test.ts`

- [ ] **Step 1: Write the failing database integration test**

Cover at least:

- creating `units_of_measure`
- creating `hospital_units`
- creating `items`
- blocking invalid `item_type`
- allowing only authenticated CSSD roles through RLS

- [ ] **Step 2: Run the integration test against local Supabase and confirm failure**

Run:

```bash
pnpm supabase start
pnpm supabase db reset
pnpm vitest run tests/integration/cssd/master-data.test.ts
```

Expected: FAIL because the tables and policies do not exist yet.

- [ ] **Step 3: Implement the schema and row-level security**

Requirements:

- create `profiles`
- create reference tables `units_of_measure`, `hospital_units`, `items`
- create enums for `app_role`, `item_type`, `stock_position`, and `movement_type`
- create `stock_balances` and `stock_movements`
- add timestamps and soft-active flags where needed
- create RLS policies that permit only CSSD roles

- [ ] **Step 4: Seed minimal development data**

Seed at least:

- one admin user profile
- one petugas profile
- a small set of `satuan`
- a small set of `unit`

- [ ] **Step 5: Re-run the integration test**

Run:

```bash
pnpm supabase db reset
pnpm vitest run tests/integration/cssd/master-data.test.ts
```

Expected: PASS.

- [ ] **Step 6: Commit the schema foundation**

```bash
git add .
git commit -m "feat: add cssd schema foundation"
```

## Chunk 2: Stock Core and Domain Services

### Task 4: Add domain constants, validators, and item code generation

**Files:**
- Create: `src/lib/cssd/constants.ts`
- Create: `src/lib/cssd/types.ts`
- Create: `src/lib/cssd/codegen/item-code.ts`
- Create: `src/lib/cssd/validators/item.ts`
- Create: `src/lib/cssd/validators/uom.ts`
- Create: `src/lib/cssd/validators/unit.ts`
- Create: `src/lib/cssd/validators/receipt.ts`
- Create: `src/lib/cssd/validators/distribution.ts`
- Create: `src/lib/cssd/validators/return.ts`
- Create: `src/lib/cssd/validators/internal-usage.ts`
- Create: `src/lib/cssd/validators/reusable-transfer.ts`
- Create: `src/lib/cssd/validators/stock-opname.ts`
- Test: `tests/unit/lib/cssd/codegen/item-code.test.ts`
- Test: `tests/unit/lib/cssd/validators/item.test.ts`
- Test: `tests/unit/lib/cssd/validators/transactions.test.ts`

- [ ] **Step 1: Write failing unit tests for code generation and validation**

Cover at least:

- automatic item code format
- editable manual code override acceptance
- `REUSABLE` return-only rule
- `CONSUMABLE_INTERNAL` internal-usage-only rule
- positive quantity validation
- required target unit for distribution

- [ ] **Step 2: Run the unit tests to verify failure**

Run:

```bash
pnpm vitest run tests/unit/lib/cssd/codegen/item-code.test.ts tests/unit/lib/cssd/validators/item.test.ts tests/unit/lib/cssd/validators/transactions.test.ts
```

Expected: FAIL because validators and codegen helpers do not exist yet.

- [ ] **Step 3: Implement the constants, types, and Zod schemas**

Requirements:

- keep all labels and enum-to-UI mappings in one place
- centralize the reusable stock positions
- ensure validators are reusable from server actions and future API handlers

- [ ] **Step 4: Re-run the unit tests**

Run:

```bash
pnpm vitest run tests/unit/lib/cssd/codegen/item-code.test.ts tests/unit/lib/cssd/validators/item.test.ts tests/unit/lib/cssd/validators/transactions.test.ts
```

Expected: PASS.

- [ ] **Step 5: Commit the domain primitives**

```bash
git add .
git commit -m "feat: add cssd validators and code generation"
```

### Task 5: Implement atomic stock mutation functions and service wrappers

**Files:**
- Create: `supabase/migrations/202606280004_stock_functions.sql`
- Create: `src/lib/cssd/services/stock.ts`
- Create: `src/lib/cssd/services/receipts.ts`
- Create: `src/lib/cssd/services/distributions.ts`
- Create: `src/lib/cssd/services/returns.ts`
- Create: `src/lib/cssd/services/internal-usages.ts`
- Create: `src/lib/cssd/services/reusable-transfers.ts`
- Test: `tests/integration/cssd/receipts.test.ts`
- Test: `tests/integration/cssd/distributions.test.ts`
- Test: `tests/integration/cssd/returns.test.ts`
- Test: `tests/integration/cssd/reusable-transfers.test.ts`
- Test: `tests/integration/cssd/internal-usages.test.ts`

- [ ] **Step 1: Write failing integration tests for each stock-changing flow**

Cover at least:

- `Pemasukan` adds stock and writes movement rows
- `Distribusi` moves reusable `READY -> IN_UNIT`
- `Distribusi` reduces consumable distribution stock and records the target unit
- `Pengembalian` only accepts reusable items and moves `IN_UNIT -> NON_STERILE` or `IN_UNIT -> DAMAGED`
- reusable transfer moves `NON_STERILE -> STERILIZATION_AREA -> READY`
- `Pemakaian Internal` only accepts `CONSUMABLE_INTERNAL`
- insufficient stock is rejected

- [ ] **Step 2: Run the integration suite and verify failure**

Run:

```bash
pnpm supabase db reset
pnpm vitest run tests/integration/cssd/receipts.test.ts tests/integration/cssd/distributions.test.ts tests/integration/cssd/returns.test.ts tests/integration/cssd/reusable-transfers.test.ts tests/integration/cssd/internal-usages.test.ts
```

Expected: FAIL because transaction functions and wrappers do not exist.

- [ ] **Step 3: Implement the database transaction functions**

Requirements:

- one function per use case is fine
- write to `stock_movements` for every stock change
- update `stock_balances` in the same transaction
- reject invalid type transitions
- reject insufficient origin stock
- capture acting user and notes

- [ ] **Step 4: Add thin TypeScript service wrappers around the database functions**

Requirements:

- validate payloads with Zod before hitting the database
- keep the wrappers framework-agnostic so server actions remain small
- return typed success and failure objects suitable for form feedback

- [ ] **Step 5: Re-run the stock integration suite**

Run:

```bash
pnpm supabase db reset
pnpm vitest run tests/integration/cssd/receipts.test.ts tests/integration/cssd/distributions.test.ts tests/integration/cssd/returns.test.ts tests/integration/cssd/reusable-transfers.test.ts tests/integration/cssd/internal-usages.test.ts
```

Expected: PASS.

- [ ] **Step 6: Commit the stock engine**

```bash
git add .
git commit -m "feat: add cssd stock mutation services"
```

### Task 6: Implement master data CRUD services

**Files:**
- Create: `src/lib/cssd/services/master-data.ts`
- Modify: `tests/integration/cssd/master-data.test.ts`

- [ ] **Step 1: Expand the failing integration test to cover CRUD rules**

Cover at least:

- create, update, and archive `satuan`
- create, update, and archive `unit`
- create and update `item`
- item code auto-generation when blank
- item code preservation when manually supplied

- [ ] **Step 2: Run the master data test to verify failure**

Run:

```bash
pnpm supabase db reset
pnpm vitest run tests/integration/cssd/master-data.test.ts
```

Expected: FAIL because service helpers do not exist.

- [ ] **Step 3: Implement the master data services**

Requirements:

- use one service module with clear sub-functions
- keep `archive` behavior as soft deactivate, not hard delete
- prevent duplicate active item codes

- [ ] **Step 4: Re-run the master data test**

Run:

```bash
pnpm supabase db reset
pnpm vitest run tests/integration/cssd/master-data.test.ts
```

Expected: PASS.

- [ ] **Step 5: Commit the master data services**

```bash
git add .
git commit -m "feat: add cssd master data services"
```

## Chunk 3: UI Shell and CSSD Workflows

### Task 7: Build the protected shell and CSSD navigation

**Files:**
- Create: `components.json`
- Create: `src/components/layout/app-sidebar.tsx`
- Create: `src/components/layout/module-header.tsx`
- Create: `src/components/layout/sidebar-nav.tsx`
- Create: `src/components/data/data-table.tsx`
- Create: `src/components/data/empty-state.tsx`
- Create: `src/components/forms/form-error.tsx`
- Create: `src/app/(protected)/cssd/layout.tsx`

- [ ] **Step 1: Initialize shadcn/ui and the UI Skills workflow**

Run:

```bash
pnpm dlx shadcn@latest init -d
npx ui-skills start
```

Expected: `components.json` is created and the UI Skills local workflow is active before UI implementation.

- [ ] **Step 2: Add only the shell-level UI primitives**

Run:

```bash
pnpm dlx shadcn@latest add button card dialog dropdown-menu form input label select separator sheet sidebar table textarea toast
```

Expected: only the primitives required for shell, forms, and tables are added.

- [ ] **Step 3: Implement the CSSD shell**

Requirements:

- sidebar top-level items are `Master Data`, `Pemasukan`, `Distribusi`, `Pengembalian`, `Pemakaian Internal`, `Stok Opname`, `Laporan`
- `Master Data` expands into `Item`, `Satuan`, and `Unit`
- no dashboard route is present
- keep layout reusable for future `Laundry` and `Ambulance`

- [ ] **Step 4: Verify the shell manually**

Run:

```bash
pnpm dev
```

Expected: authenticated CSSD users can navigate the sidebar without broken routes or missing styles.

- [ ] **Step 5: Commit the app shell**

```bash
git add .
git commit -m "feat: add cssd protected app shell"
```

### Task 8: Ship Master Data pages and actions

**Files:**
- Create: `src/app/(protected)/cssd/master-data/items/page.tsx`
- Create: `src/app/(protected)/cssd/master-data/items/actions.ts`
- Create: `src/app/(protected)/cssd/master-data/satuan/page.tsx`
- Create: `src/app/(protected)/cssd/master-data/satuan/actions.ts`
- Create: `src/app/(protected)/cssd/master-data/unit/page.tsx`
- Create: `src/app/(protected)/cssd/master-data/unit/actions.ts`
- Modify: `src/lib/cssd/services/master-data.ts`

- [ ] **Step 1: Write a failing component-level test or interaction smoke test**

Cover at least:

- item creation form shows `item_type`
- item code can be auto-filled and manually edited
- `satuan` and `unit` can be added from their respective pages

- [ ] **Step 2: Run the UI test to verify failure**

Run:

```bash
pnpm vitest run tests/unit/lib/cssd/validators/item.test.ts
```

Expected: at least one UI-connected scenario still fails because server actions and pages do not exist.

- [ ] **Step 3: Implement the Master Data pages and server actions**

Requirements:

- use server actions that call `master-data.ts`
- keep forms small and inline where practical
- use shared table and form error components
- show active status clearly

- [ ] **Step 4: Verify manually in the browser**

Run:

```bash
pnpm dev
```

Expected: CSSD staff can create and edit `Item`, `Satuan`, and `Unit`.

- [ ] **Step 5: Commit the Master Data UI**

```bash
git add .
git commit -m "feat: add cssd master data pages"
```

### Task 9: Ship `Pemasukan`, `Distribusi`, and `Pengembalian`

**Files:**
- Create: `src/app/(protected)/cssd/pemasukan/page.tsx`
- Create: `src/app/(protected)/cssd/pemasukan/actions.ts`
- Create: `src/app/(protected)/cssd/distribusi/page.tsx`
- Create: `src/app/(protected)/cssd/distribusi/actions.ts`
- Create: `src/app/(protected)/cssd/pengembalian/page.tsx`
- Create: `src/app/(protected)/cssd/pengembalian/actions.ts`
- Modify: `src/lib/cssd/services/receipts.ts`
- Modify: `src/lib/cssd/services/distributions.ts`
- Modify: `src/lib/cssd/services/returns.ts`
- Modify: `src/lib/cssd/services/reusable-transfers.ts`

- [ ] **Step 1: Write failing interaction tests for the three transaction pages**

Cover at least:

- receipt saves and stock appears in `READY`
- distribution blocks quantity larger than stock
- return form only offers reusable items
- return can send items to `Tidak Steril` or `Rusak`

- [ ] **Step 2: Run the transaction tests and verify failure**

Run:

```bash
pnpm vitest run tests/integration/cssd/receipts.test.ts tests/integration/cssd/distributions.test.ts tests/integration/cssd/returns.test.ts
```

Expected: FAIL or partially fail because pages and actions are missing.

- [ ] **Step 3: Implement the three transaction pages**

Requirements:

- use a list + create form + detail drawer or detail section pattern
- show stock impact feedback after submission
- keep reusable-only logic inside validation and UI filtering

- [ ] **Step 4: Add reusable processing actions inside the return flow**

Requirements:

- from returned reusable rows, support `Tidak Steril -> Area Sterilisasi`
- support `Area Sterilisasi -> Siap Pakai`
- support marking relevant items as `Rusak`
- do not add a new top-level menu

- [ ] **Step 5: Verify manually**

Run:

```bash
pnpm dev
```

Expected: the end-to-end reusable circulation path works from receipt to redistribution readiness.

- [ ] **Step 6: Commit the core circulation UI**

```bash
git add .
git commit -m "feat: add cssd receipt distribution and return flows"
```

### Task 10: Ship `Pemakaian Internal` and `Stok Opname`

**Files:**
- Create: `src/app/(protected)/cssd/pemakaian-internal/page.tsx`
- Create: `src/app/(protected)/cssd/pemakaian-internal/actions.ts`
- Create: `src/app/(protected)/cssd/stok-opname/page.tsx`
- Create: `src/app/(protected)/cssd/stok-opname/actions.ts`
- Create: `src/lib/cssd/services/stock-opname.ts`
- Modify: `supabase/migrations/202606280004_stock_functions.sql`
- Test: `tests/integration/cssd/internal-usages.test.ts`
- Test: `tests/integration/cssd/stock-opname.test.ts`

- [ ] **Step 1: Write failing tests for internal usage and stock opname**

Cover at least:

- internal usage only accepts `CONSUMABLE_INTERNAL`
- internal usage reduces stock and writes movement rows
- stock opname draft does not change balances
- stock opname finalization creates adjustment movements

- [ ] **Step 2: Run the tests to verify failure**

Run:

```bash
pnpm supabase db reset
pnpm vitest run tests/integration/cssd/internal-usages.test.ts tests/integration/cssd/stock-opname.test.ts
```

Expected: FAIL because the remaining transaction flows do not exist.

- [ ] **Step 3: Implement the internal usage page and services**

Requirements:

- minimal fields only: item, qty, date, notes
- filter item picker to `CONSUMABLE_INTERNAL`

- [ ] **Step 4: Implement the stock opname draft/final flow**

Requirements:

- session header with status
- line entry per item and position
- finalize button blocked until draft is complete enough
- finalization handled through an atomic database function

- [ ] **Step 5: Re-run the internal usage and stock opname tests**

Run:

```bash
pnpm supabase db reset
pnpm vitest run tests/integration/cssd/internal-usages.test.ts tests/integration/cssd/stock-opname.test.ts
```

Expected: PASS.

- [ ] **Step 6: Commit the remaining transaction flows**

```bash
git add .
git commit -m "feat: add cssd internal usage and stock opname"
```

## Chunk 4: Reporting, Verification, and Release Readiness

### Task 11: Build report queries and the `Laporan` page

**Files:**
- Create: `supabase/migrations/202606280005_reporting_views.sql`
- Create: `src/lib/cssd/services/reports.ts`
- Create: `src/app/(protected)/cssd/laporan/page.tsx`
- Test: `tests/integration/cssd/reports.test.ts`

- [ ] **Step 1: Write the failing report integration test**

Cover at least:

- current stock report groups reusable balances by position
- transaction history returns chronological records
- item stock card shows movement traceability for one item

- [ ] **Step 2: Run the report test and verify failure**

Run:

```bash
pnpm supabase db reset
pnpm vitest run tests/integration/cssd/reports.test.ts
```

Expected: FAIL because reporting queries do not exist.

- [ ] **Step 3: Implement report views and typed report services**

Requirements:

- optimize reads for `stok saat ini`, `riwayat transaksi`, and `kartu stok`
- keep read models separate from stock mutation services
- support filters by item, date, and unit where they make sense

- [ ] **Step 4: Implement the `Laporan` page**

Requirements:

- one page with clear sections or tabs
- reuse the same table primitives
- do not add export features in MVP

- [ ] **Step 5: Re-run the report test**

Run:

```bash
pnpm supabase db reset
pnpm vitest run tests/integration/cssd/reports.test.ts
```

Expected: PASS.

- [ ] **Step 6: Commit reporting**

```bash
git add .
git commit -m "feat: add cssd reporting"
```

### Task 12: Harden the app, document setup, and verify the release candidate

**Files:**
- Modify: `.env.example`
- Modify: `package.json`
- Create: `README.md`
- Modify: any touched CSSD pages or services that still fail final verification

- [ ] **Step 1: Add final developer and deployment documentation**

Document at least:

- local setup
- Supabase startup/reset commands
- test commands
- required environment variables
- role seeding assumptions
- reminder to run `npx ui-skills start` before future UI-heavy work

- [ ] **Step 2: Run the full quality gate**

Run:

```bash
pnpm lint
pnpm exec tsc --noEmit
pnpm vitest run
pnpm build
```

Expected: all commands pass.

- [ ] **Step 3: Run the final manual smoke test**

Check at least:

- login
- create item
- receipt
- distribution
- return to `Tidak Steril`
- move to `Area Sterilisasi`
- move to `Siap Pakai`
- internal usage
- stock opname draft and final
- reports

- [ ] **Step 4: Commit the release candidate**

```bash
git add .
git commit -m "feat: complete ncis cssd mvp"
```

## Suggested Execution Order

1. Chunk 1
2. Chunk 2
3. Chunk 3
4. Chunk 4

## Notes For Execution

- Prefer `pnpm` consistently for all Node tasks.
- Keep server actions thin; domain services and SQL functions should own business rules.
- Resist adding batch tracking, supplier data, exports, or a dashboard in this plan.
- When UI work starts, keep `npx ui-skills start` active and use it before making major visual changes.

Plan complete and saved to `docs/superpowers/plans/2026-06-28-ncis-cssd-mvp.md`. Ready to execute?
