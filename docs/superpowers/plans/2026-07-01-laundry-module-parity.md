# Laundry Module Parity Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Menambahkan modul Laundry yang setara dengan CSSD, dengan role, route, backend, dan laporan yang terpisah penuh, sekaligus merapikan label CSSD dari `Siap Pakai` menjadi `Steril`.

**Architecture:** Laundry dibangun sebagai modul paralel terhadap CSSD, bukan refactor generik besar. Kita perluas auth untuk mengenali dua keluarga role, aktifkan shell modul Laundry, tambahkan migration dan service Laundry yang terpisah, lalu bangun parity UI dengan istilah Laundry dan regression coverage untuk memastikan CSSD tetap stabil.

**Tech Stack:** Next.js App Router, React 19, TypeScript, Supabase/Postgres, Vitest, Testing Library

---

## File Structure

### Existing files to modify

- `src/lib/auth/roles.ts`
  Responsibility: daftar role aplikasi dan normalisasi role dari profile/auth.
- `src/lib/auth/guards.ts`
  Responsibility: helper akses CSSD; perlu diperluas agar mendukung Laundry dan helper akses generik modul.
- `src/lib/auth/demo-users.ts`
  Responsibility: bootstrap demo users; perlu menambahkan akun Laundry.
- `scripts/bootstrap-demo-auth.ts`
  Responsibility: menyiapkan demo auth lokal dengan password env.
- `src/app/(auth)/login/actions.ts`
  Responsibility: login flow dan redirect berdasarkan role pengguna.
- `src/app/(auth)/login/page.tsx`
  Responsibility: redirect login saat user sudah punya role modul yang valid.
- `src/lib/supabase/middleware.ts`
  Responsibility: route protection untuk modul bertanda `/cssd`; perlu mendukung `/laundry`.
- `src/components/layout/module-header.tsx`
  Responsibility: header modul dan selector modul; perlu menandai Laundry sebagai modul aktif.
- `src/components/layout/sidebar-nav.tsx`
  Responsibility: grouped nav pattern; bisa dipakai ulang untuk Laundry jika dibuat lebih umum.
- `src/lib/cssd/constants.ts`
  Responsibility: constants CSSD saat ini; perlu dirapikan untuk label `Steril` dan mungkin diekstrak sedikit agar pola Laundry konsisten.
- `src/app/(protected)/cssd/layout.tsx`
  Responsibility: layout CSSD dan role label; label CSSD perlu tetap benar setelah auth diperluas.
- `supabase/seed.sql`
  Responsibility: seed demo profile; perlu menambahkan profile Laundry bila seed dipakai.
- `supabase/migrations/202606280001_init_auth_and_reference_tables.sql`
  Responsibility: enum role, helper role DB, dan reference auth bootstrap; perlu diperluas untuk role Laundry.
- `supabase/migrations/202606280002_stock_core.sql`
  Responsibility: core stock CSSD; dapat dijadikan referensi untuk migration Laundry.
- `supabase/migrations/202606280003_transaction_tables.sql`
  Responsibility: transaksi CSSD; dapat dijadikan referensi untuk transaksi Laundry.
- `supabase/migrations/202606300002_service_role_grants.sql`
  Responsibility: service role grants CSSD; perlu diperluas untuk objek Laundry.
- `src/lib/cssd/services/*.ts`
  Responsibility: service CSSD saat ini; menjadi referensi parity untuk service Laundry.
- `tests/integration/cssd/helpers/local-supabase.ts`
  Responsibility: helper test auth/RPC/report CSSD; perlu diperluas agar bisa memfasilitasi test Laundry.
- `tests/integration/auth/*.test.ts`
  Responsibility: regression auth dan role routing.

### New files to create

#### Laundry app shell

- `src/app/(protected)/laundry/layout.tsx`
  Responsibility: layout modul Laundry dan route access guard.
- `src/app/(protected)/laundry/page.tsx`
  Responsibility: landing page modul Laundry.

#### Laundry page routes

- `src/app/(protected)/laundry/master-data/items/page.tsx`
- `src/app/(protected)/laundry/master-data/satuan/page.tsx`
- `src/app/(protected)/laundry/master-data/unit/page.tsx`
- `src/app/(protected)/laundry/pemasukan/page.tsx`
- `src/app/(protected)/laundry/distribusi/page.tsx`
- `src/app/(protected)/laundry/pengembalian/page.tsx`
- `src/app/(protected)/laundry/pemakaian-internal/page.tsx`
- `src/app/(protected)/laundry/stok-opname/page.tsx`
- `src/app/(protected)/laundry/laporan/page.tsx`
- `src/app/(protected)/laundry/laporan/riwayat-transaksi/page.tsx`
- `src/app/(protected)/laundry/laporan/stok-status/page.tsx`
- `src/app/(protected)/laundry/laporan/kartu-stok/page.tsx`
- `src/app/(protected)/laundry/laporan/riwayat-transaksi/export/route.ts`
- `src/app/(protected)/laundry/laporan/stok-status/export/route.ts`
- `src/app/(protected)/laundry/laporan/kartu-stok/export/route.ts`

#### Laundry module config and services

- `src/lib/laundry/constants.ts`
  Responsibility: item labels, stock status labels Laundry, route meta, nav items, module metadata.
- `src/lib/laundry/types.ts`
  Responsibility: Laundry item and stock-related type aliases.
- `src/lib/laundry/services/master-data.ts`
- `src/lib/laundry/services/receipts.ts`
- `src/lib/laundry/services/distributions.ts`
- `src/lib/laundry/services/returns.ts`
- `src/lib/laundry/services/internal-usages.ts`
- `src/lib/laundry/services/stock-opname.ts`
- `src/lib/laundry/services/reports.ts`
- `src/lib/laundry/services/transaction-read-models.ts`
- `src/lib/laundry/reports/csv-export.ts`

#### Laundry SQL migrations

- `supabase/migrations/202607010001_expand_roles_for_laundry.sql`
  Responsibility: enum role expansion, role helper DB update, and auth helper compatibility.
- `supabase/migrations/202607010002_laundry_stock_core.sql`
  Responsibility: Laundry stock core tables/types/functions/RLS.
- `supabase/migrations/202607010003_laundry_transaction_tables.sql`
  Responsibility: Laundry transaction tables, functions, report views, RLS.
- `supabase/migrations/202607010004_laundry_service_role_grants.sql`
  Responsibility: service role grants for Laundry objects.

#### Tests

- `tests/unit/auth/roles-laundry.test.ts`
- `tests/unit/auth/guards-laundry.test.ts`
- `tests/unit/components/layout/module-header-laundry.test.tsx`
- `tests/unit/components/layout/sidebar-nav-laundry.test.tsx`
- `tests/unit/lib/laundry/report-csv-export.test.ts`
- `tests/unit/app/laundry/report-export-routes.test.ts`
- `tests/unit/app/laundry/report-pages-export-links.test.tsx`
- `tests/integration/laundry/helpers/local-supabase.ts`
- `tests/integration/laundry/master-data.test.ts`
- `tests/integration/laundry/receipts.test.ts`
- `tests/integration/laundry/distributions.test.ts`
- `tests/integration/laundry/returns.test.ts`
- `tests/integration/laundry/internal-usages.test.ts`
- `tests/integration/laundry/stock-opname.test.ts`
- `tests/integration/laundry/reports.test.ts`

### Optional extraction only if the code becomes too repetitive

- `src/lib/auth/module-access.ts`
  Responsibility: shared route-access decision helpers for CSSD and Laundry.
- `src/components/layout/module-sidebar-nav.tsx`
  Responsibility: generic grouped nav renderer if CSSD/Laundry layouts would otherwise duplicate too much.

Create these only if needed during execution; do not refactor aggressively upfront.

---

## Chunk 1: Expand Auth And Route Guards For Laundry

### Task 1: Add failing role normalization and guard coverage for Laundry

**Files:**
- Create: `tests/unit/auth/roles-laundry.test.ts`
- Create: `tests/unit/auth/guards-laundry.test.ts`
- Modify later:
  - `src/lib/auth/roles.ts`
  - `src/lib/auth/guards.ts`

- [ ] **Step 1: Write the failing tests**

Add coverage for:

- `normalizeRole("ADMIN_LAUNDRY")` and `normalizeRole("PETUGAS_LAUNDRY")`
- new helper `isLaundryRole(...)`
- route decision logic that:
  - allows Laundry role into `/laundry`
  - denies CSSD role into `/laundry`
  - denies Laundry role into `/cssd`
  - still allows CSSD role into `/cssd`

Prefer pure decision-level testing over integration at this stage.

- [ ] **Step 2: Run tests to verify they fail**

Run:

```bash
pnpm vitest run tests/unit/auth/roles-laundry.test.ts tests/unit/auth/guards-laundry.test.ts
```

Expected:
- FAIL because Laundry role helpers do not exist yet

- [ ] **Step 3: Write minimal implementation**

Update `src/lib/auth/roles.ts`:

- add `ADMIN_LAUNDRY`
- add `PETUGAS_LAUNDRY`
- expand `AppRole`
- update `normalizeRole`

Update `src/lib/auth/guards.ts`:

- add `isLaundryRole`
- add Laundry access decision helper
- keep CSSD helper behavior unchanged

If the file gets noisy, extract shared decision logic to `src/lib/auth/module-access.ts`.

- [ ] **Step 4: Run tests to verify they pass**

Run:

```bash
pnpm vitest run tests/unit/auth/roles-laundry.test.ts tests/unit/auth/guards-laundry.test.ts
```

Expected:
- PASS

- [ ] **Step 5: Commit**

```bash
git add src/lib/auth/roles.ts src/lib/auth/guards.ts tests/unit/auth/roles-laundry.test.ts tests/unit/auth/guards-laundry.test.ts
git commit -m "feat: add laundry auth roles and guards"
```

### Task 2: Extend login, middleware, and demo-user bootstrap for Laundry roles

**Files:**
- Modify:
  - `src/app/(auth)/login/actions.ts`
  - `src/app/(auth)/login/page.tsx`
  - `src/lib/supabase/middleware.ts`
  - `src/lib/auth/demo-users.ts`
  - `scripts/bootstrap-demo-auth.ts`
- Test:
  - `tests/integration/auth/guards.test.ts`
  - `tests/unit/auth/login-action-flow.test.ts`
  - `tests/unit/auth/middleware.test.ts`

- [ ] **Step 1: Write the failing tests**

Extend auth test coverage so it asserts:

- Laundry users are treated as valid module users on login
- middleware redirects unauthenticated users away from `/laundry`
- CSSD users cannot access `/laundry`
- Laundry users cannot access `/cssd`
- demo users include Laundry variants

- [ ] **Step 2: Run tests to verify they fail**

Run:

```bash
pnpm vitest run tests/integration/auth/guards.test.ts tests/unit/auth/login-action-flow.test.ts tests/unit/auth/middleware.test.ts
```

Expected:
- FAIL because Laundry routes/roles are not recognized

- [ ] **Step 3: Write minimal implementation**

Update:

- login redirect logic to send Laundry users to `/laundry`
- middleware route protection to understand `/laundry`
- demo user bootstrap to add:
  - `admin.laundry@ncis.local`
  - `petugas.laundry@ncis.local`

Prefer extending current helpers over rewriting login flow.

- [ ] **Step 4: Run tests to verify they pass**

Run:

```bash
pnpm vitest run tests/integration/auth/guards.test.ts tests/unit/auth/login-action-flow.test.ts tests/unit/auth/middleware.test.ts
```

Expected:
- PASS

- [ ] **Step 5: Commit**

```bash
git add src/app/\(auth\)/login/actions.ts src/app/\(auth\)/login/page.tsx src/lib/supabase/middleware.ts src/lib/auth/demo-users.ts scripts/bootstrap-demo-auth.ts tests/integration/auth/guards.test.ts tests/unit/auth/login-action-flow.test.ts tests/unit/auth/middleware.test.ts
git commit -m "feat: extend auth flow for laundry access"
```

---

## Chunk 2: Activate Laundry Shell And Shared Navigation

### Task 3: Add Laundry module constants, metadata, and grouped navigation coverage

**Files:**
- Create: `src/lib/laundry/constants.ts`
- Create: `tests/unit/components/layout/sidebar-nav-laundry.test.tsx`
- Create: `tests/unit/components/layout/module-header-laundry.test.tsx`
- Modify:
  - `src/components/layout/module-header.tsx`
  - `src/components/layout/sidebar-nav.tsx`
  - `src/lib/cssd/constants.ts`

- [ ] **Step 1: Write the failing tests**

Add tests that assert:

- module selector now recognizes Laundry as active module
- `/laundry/master-data/...` auto-expands `Master Data`
- `/laundry/laporan/...` auto-expands `Laporan`
- Laundry child routes resolve the correct title/description in header

- [ ] **Step 2: Run tests to verify they fail**

Run:

```bash
pnpm vitest run tests/unit/components/layout/sidebar-nav-laundry.test.tsx tests/unit/components/layout/module-header-laundry.test.tsx
```

Expected:
- FAIL because Laundry constants/routes do not exist yet

- [ ] **Step 3: Write minimal implementation**

Create `src/lib/laundry/constants.ts` with:

- Laundry stock labels
- Laundry nav items
- Laundry route meta

Update shared layout components so they can resolve both CSSD and Laundry route sets cleanly.

Do not rewrite the whole nav system unless needed.

- [ ] **Step 4: Run tests to verify they pass**

Run:

```bash
pnpm vitest run tests/unit/components/layout/sidebar-nav-laundry.test.tsx tests/unit/components/layout/module-header-laundry.test.tsx tests/unit/components/layout/sidebar-nav.test.tsx tests/unit/components/layout/module-header.test.tsx
```

Expected:
- PASS

- [ ] **Step 5: Commit**

```bash
git add src/lib/laundry/constants.ts src/components/layout/module-header.tsx src/components/layout/sidebar-nav.tsx tests/unit/components/layout/sidebar-nav-laundry.test.tsx tests/unit/components/layout/module-header-laundry.test.tsx
git commit -m "feat: add laundry module shell metadata"
```

### Task 4: Add Laundry layouts and landing routes

**Files:**
- Create:
  - `src/app/(protected)/laundry/layout.tsx`
  - `src/app/(protected)/laundry/page.tsx`
- Reference:
  - `src/app/(protected)/cssd/layout.tsx`
  - `src/app/(protected)/cssd/page.tsx`

- [ ] **Step 1: Write the failing test**

If equivalent route-component coverage already exists, extend it. Otherwise, rely on typecheck/build verification for the initial layout shell.

- [ ] **Step 2: Write minimal implementation**

Create Laundry layout:

- requires Laundry access
- shows proper role label
- renders Laundry nav tree

Create Laundry landing page:

- mirrors CSSD workspace style
- uses Laundry wording

- [ ] **Step 3: Run focused verification**

Run:

```bash
pnpm exec tsc --noEmit
```

Expected:
- PASS

- [ ] **Step 4: Commit**

```bash
git add src/app/\(protected\)/laundry/layout.tsx src/app/\(protected\)/laundry/page.tsx
git commit -m "feat: add laundry app shell"
```

---

## Chunk 3: Add Laundry Database Core And Reference Data

### Task 5: Add failing integration coverage for Laundry master data authorization and persistence

**Files:**
- Create: `tests/integration/laundry/helpers/local-supabase.ts`
- Create: `tests/integration/laundry/master-data.test.ts`
- Modify later:
  - `supabase/migrations/202607010001_expand_roles_for_laundry.sql`
  - `supabase/migrations/202607010002_laundry_stock_core.sql`
  - `supabase/migrations/202607010004_laundry_service_role_grants.sql`

- [ ] **Step 1: Write the failing test**

Add Laundry integration coverage mirroring CSSD master-data tests:

- service role can create Laundry UOM/unit/item data
- Laundry authenticated roles pass RLS
- CSSD roles do not gain Laundry access automatically

Use a dedicated Laundry helper file to avoid contaminating CSSD test fixtures.

- [ ] **Step 2: Run test to verify it fails**

Run:

```bash
pnpm vitest run tests/integration/laundry/master-data.test.ts
```

Expected:
- FAIL because Laundry schema/functions/RLS do not exist yet

- [ ] **Step 3: Write minimal implementation**

Create migrations:

- expand `app_role` enum and role helper SQL
- add Laundry reference/core stock tables, constraints, triggers, and RLS helper like `is_laundry_role()`
- add service role grants for Laundry core objects

Keep CSSD objects untouched unless required by enum/role expansion.

- [ ] **Step 4: Run test to verify it passes**

Run:

```bash
pnpm vitest run tests/integration/laundry/master-data.test.ts
```

Expected:
- PASS

- [ ] **Step 5: Commit**

```bash
git add supabase/migrations/202607010001_expand_roles_for_laundry.sql supabase/migrations/202607010002_laundry_stock_core.sql supabase/migrations/202607010004_laundry_service_role_grants.sql tests/integration/laundry/helpers/local-supabase.ts tests/integration/laundry/master-data.test.ts
git commit -m "feat: add laundry stock core and roles"
```

---

## Chunk 4: Add Laundry Transaction Backend And Reports

### Task 6: Add failing integration coverage for Laundry transactions and reports

**Files:**
- Create:
  - `tests/integration/laundry/receipts.test.ts`
  - `tests/integration/laundry/distributions.test.ts`
  - `tests/integration/laundry/returns.test.ts`
  - `tests/integration/laundry/internal-usages.test.ts`
  - `tests/integration/laundry/stock-opname.test.ts`
  - `tests/integration/laundry/reports.test.ts`
- Create later:
  - `src/lib/laundry/services/receipts.ts`
  - `src/lib/laundry/services/distributions.ts`
  - `src/lib/laundry/services/returns.ts`
  - `src/lib/laundry/services/internal-usages.ts`
  - `src/lib/laundry/services/stock-opname.ts`
  - `src/lib/laundry/services/reports.ts`
  - `src/lib/laundry/services/transaction-read-models.ts`
- Modify later:
  - `supabase/migrations/202607010003_laundry_transaction_tables.sql`

- [ ] **Step 1: Write the failing tests**

Mirror the CSSD transaction/report integration suite for Laundry:

- receipt
- distribution
- return
- internal usage
- stock opname
- report rows and balances

Adapt expectations to Laundry labels:

- `READY` → `Bersih`
- `NON_STERILE` → `Kotor`
- `STERILIZATION_AREA` → `Area Pencucian`

- [ ] **Step 2: Run tests to verify they fail**

Run:

```bash
pnpm vitest run tests/integration/laundry/receipts.test.ts tests/integration/laundry/distributions.test.ts tests/integration/laundry/returns.test.ts tests/integration/laundry/internal-usages.test.ts tests/integration/laundry/stock-opname.test.ts tests/integration/laundry/reports.test.ts
```

Expected:
- FAIL because Laundry transaction objects do not exist yet

- [ ] **Step 3: Write minimal implementation**

Add Laundry transaction migration and service layer:

- transaction tables and lines
- SQL functions for receipt/distribution/return/internal usage/opname
- Laundry report views
- TypeScript service wrappers and report readers

Keep names parallel to CSSD for easier review.

- [ ] **Step 4: Run tests to verify they pass**

Run:

```bash
pnpm vitest run tests/integration/laundry/receipts.test.ts tests/integration/laundry/distributions.test.ts tests/integration/laundry/returns.test.ts tests/integration/laundry/internal-usages.test.ts tests/integration/laundry/stock-opname.test.ts tests/integration/laundry/reports.test.ts
```

Expected:
- PASS

- [ ] **Step 5: Commit**

```bash
git add supabase/migrations/202607010003_laundry_transaction_tables.sql src/lib/laundry/services tests/integration/laundry
git commit -m "feat: add laundry transaction backend and reports"
```

---

## Chunk 5: Build Laundry UI Parity And CSV Export

### Task 7: Add Laundry master-data and transaction pages

**Files:**
- Create all Laundry page routes for master data and transactions:
  - `src/app/(protected)/laundry/master-data/items/page.tsx`
  - `src/app/(protected)/laundry/master-data/satuan/page.tsx`
  - `src/app/(protected)/laundry/master-data/unit/page.tsx`
  - `src/app/(protected)/laundry/pemasukan/page.tsx`
  - `src/app/(protected)/laundry/distribusi/page.tsx`
  - `src/app/(protected)/laundry/pengembalian/page.tsx`
  - `src/app/(protected)/laundry/pemakaian-internal/page.tsx`
  - `src/app/(protected)/laundry/stok-opname/page.tsx`
- Reference existing CSSD views/components and extract only if needed.

- [ ] **Step 1: Write the failing test**

Prefer focused rendering tests if the current codebase already uses page/view tests for similar screens. Otherwise, defer to typecheck plus browser verification for initial parity pages.

- [ ] **Step 2: Write minimal implementation**

Build Laundry pages by following the CSSD page structure:

- same forms
- same grouped nav behavior
- same table layout
- Laundry labels and route namespace

Reuse shared components when safe; duplicate when domain wording would otherwise become tangled.

- [ ] **Step 3: Run focused verification**

Run:

```bash
pnpm exec tsc --noEmit
```

Expected:
- PASS

- [ ] **Step 4: Commit**

```bash
git add src/app/\(protected\)/laundry/master-data src/app/\(protected\)/laundry/pemasukan src/app/\(protected\)/laundry/distribusi src/app/\(protected\)/laundry/pengembalian src/app/\(protected\)/laundry/pemakaian-internal src/app/\(protected\)/laundry/stok-opname
git commit -m "feat: add laundry master data and transaction pages"
```

### Task 8: Add Laundry reports and CSV export parity

**Files:**
- Create:
  - `src/app/(protected)/laundry/laporan/page.tsx`
  - `src/app/(protected)/laundry/laporan/riwayat-transaksi/page.tsx`
  - `src/app/(protected)/laundry/laporan/stok-status/page.tsx`
  - `src/app/(protected)/laundry/laporan/kartu-stok/page.tsx`
  - `src/app/(protected)/laundry/laporan/riwayat-transaksi/export/route.ts`
  - `src/app/(protected)/laundry/laporan/stok-status/export/route.ts`
  - `src/app/(protected)/laundry/laporan/kartu-stok/export/route.ts`
  - `src/lib/laundry/reports/csv-export.ts`
- Create tests:
  - `tests/unit/lib/laundry/report-csv-export.test.ts`
  - `tests/unit/app/laundry/report-export-routes.test.ts`
  - `tests/unit/app/laundry/report-pages-export-links.test.tsx`

- [ ] **Step 1: Write the failing tests**

Cover:

- Laundry CSV headers and filenames
- Laundry report export route response headers
- Laundry report page `Export CSV` actions
- Laundry page labels (`Bersih`, `Kotor`, `Area Pencucian`) in report outputs

- [ ] **Step 2: Run tests to verify they fail**

Run:

```bash
pnpm vitest run tests/unit/lib/laundry/report-csv-export.test.ts tests/unit/app/laundry/report-export-routes.test.ts tests/unit/app/laundry/report-pages-export-links.test.tsx
```

Expected:
- FAIL because Laundry report UI/export files do not exist yet

- [ ] **Step 3: Write minimal implementation**

Build Laundry report pages and export routes by mirroring the CSSD report implementation and swapping:

- route namespace
- service imports
- label strings

Reuse generic `src/lib/csv.ts`.

- [ ] **Step 4: Run tests to verify they pass**

Run:

```bash
pnpm vitest run tests/unit/lib/laundry/report-csv-export.test.ts tests/unit/app/laundry/report-export-routes.test.ts tests/unit/app/laundry/report-pages-export-links.test.tsx
```

Expected:
- PASS

- [ ] **Step 5: Commit**

```bash
git add src/app/\(protected\)/laundry/laporan src/lib/laundry/reports/csv-export.ts tests/unit/lib/laundry/report-csv-export.test.ts tests/unit/app/laundry/report-export-routes.test.ts tests/unit/app/laundry/report-pages-export-links.test.tsx
git commit -m "feat: add laundry reports and csv export"
```

---

## Chunk 6: CSSD Terminology Update And Final Verification

### Task 9: Change CSSD `Siap Pakai` label to `Steril` with regression tests

**Files:**
- Modify:
  - `src/lib/cssd/constants.ts`
  - CSSD tests that assert label text
  - CSSD report/unit tests affected by wording

- [ ] **Step 1: Write the failing test updates**

Update CSSD assertions so they expect:

- `READY` label = `Steril`
- any page/report wording derived from this label reflects `Steril`

- [ ] **Step 2: Run tests to verify they fail**

Run:

```bash
pnpm vitest run tests/integration/cssd/reports.test.ts tests/unit/components/layout/sidebar-nav.test.tsx tests/unit/components/layout/module-header.test.tsx tests/unit/lib/cssd/report-formatting.test.ts tests/unit/app/cssd/report-pages-export-links.test.tsx
```

Expected:
- FAIL where old wording still says `Siap Pakai`

- [ ] **Step 3: Write minimal implementation**

Update `src/lib/cssd/constants.ts` and any small dependent wording so CSSD consistently shows `Steril`.

- [ ] **Step 4: Run tests to verify they pass**

Run:

```bash
pnpm vitest run tests/integration/cssd/reports.test.ts tests/unit/components/layout/sidebar-nav.test.tsx tests/unit/components/layout/module-header.test.tsx tests/unit/lib/cssd/report-formatting.test.ts tests/unit/app/cssd/report-pages-export-links.test.tsx
```

Expected:
- PASS

- [ ] **Step 5: Commit**

```bash
git add src/lib/cssd/constants.ts tests
git commit -m "feat: rename cssd ready stock label to steril"
```

### Task 10: Run final verification for CSSD + Laundry parity

**Files:**
- Verify only

- [ ] **Step 1: Run focused CSSD and Laundry tests**

Run:

```bash
pnpm vitest run tests/integration/auth tests/integration/cssd tests/integration/laundry tests/unit/auth tests/unit/components/layout tests/unit/lib/cssd tests/unit/lib/laundry tests/unit/app/cssd tests/unit/app/laundry
```

Expected:
- PASS

- [ ] **Step 2: Run typecheck and build**

Run:

```bash
pnpm exec tsc --noEmit
pnpm build
```

Expected:
- PASS

- [ ] **Step 3: Manual browser verification**

Check:

- login as CSSD user routes to CSSD
- login as Laundry user routes to Laundry
- CSSD user cannot open Laundry routes
- Laundry user cannot open CSSD routes
- Laundry pages show `Bersih`, `Kotor`, `Area Pencucian`
- CSSD pages show `Steril`
- Laundry export CSV works on all three report pages

- [ ] **Step 4: Commit**

```bash
git add .
git commit -m "feat: add laundry module parity with cssd"
```

---

Plan complete and saved to `docs/superpowers/plans/2026-07-01-laundry-module-parity.md`. Ready to execute?
