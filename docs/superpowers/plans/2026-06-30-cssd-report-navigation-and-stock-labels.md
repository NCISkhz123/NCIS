# CSSD Report Navigation And Stock Labels Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Split CSSD reporting into three dedicated pages, make internal CSSD stock rows display `CSSD` as the unit label, and fix stock card output so internal CSSD movements render correctly.

**Architecture:** Keep stock mutation logic unchanged and fix the problem at the reporting/read-model layer first. After report rows are normalized, split the current monolithic `/cssd/laporan` server page into three focused routes and then align sidebar/header navigation to the grouped submenu pattern already used by `Master Data`.

**Tech Stack:** Next.js App Router, React 19, TypeScript, Supabase/Postgres, Vitest, Testing Library

---

## File Structure

### Existing files to modify

- `src/lib/cssd/services/reports.ts`
  Responsibility: SQL-report mapping and formatting for current stock, transaction history, and item stock card pages.
- `tests/integration/cssd/reports.test.ts`
  Responsibility: end-to-end verification of report service behavior against local Supabase test data.
- `src/app/(protected)/cssd/laporan/page.tsx`
  Responsibility: current monolithic report page; convert to redirect-only route.
- `src/lib/cssd/constants.ts`
  Responsibility: CSSD sidebar item definitions and route metadata.
- `src/components/layout/sidebar-nav.tsx`
  Responsibility: grouped CSSD sidebar rendering and show/hide behavior.
- `src/components/layout/module-header.tsx`
  Responsibility: title and description selection for active CSSD routes.
- `tests/unit/components/layout/sidebar-nav.test.tsx`
  Responsibility: grouped navigation behavior in the sidebar.

### New files to create

- `src/app/(protected)/cssd/laporan/riwayat-transaksi/page.tsx`
  Responsibility: dedicated transaction history report page and filter handling.
- `src/app/(protected)/cssd/laporan/stok-status/page.tsx`
  Responsibility: dedicated current stock status report page and filter handling.
- `src/app/(protected)/cssd/laporan/kartu-stok/page.tsx`
  Responsibility: dedicated item stock card page and filter handling.
- `src/components/cssd/reports/section-header.tsx`
  Responsibility: shared section header used by report pages.
- `src/components/cssd/reports/filter-field.tsx`
  Responsibility: shared labeled filter control wrapper.
- `tests/unit/components/layout/module-header.test.tsx`
  Responsibility: route metadata resolution for report child routes.

### Optional file split only if the route pages become noisy

- `src/components/cssd/reports/stok-status-report-view.tsx`
- `src/components/cssd/reports/riwayat-transaksi-report-view.tsx`
- `src/components/cssd/reports/kartu-stok-report-view.tsx`

Create these only if the page files become difficult to read while implementing.

---

## Chunk 1: Fix Report Row Formatting And Stock Card Output

### Task 1: Add failing integration coverage for internal CSSD unit labels

**Files:**
- Modify: `tests/integration/cssd/reports.test.ts`
- Reference: `src/lib/cssd/services/reports.ts`

- [ ] **Step 1: Write the failing test**

Extend the existing report integration coverage so it asserts:

- current stock rows with `READY`, `NON_STERILE`, and `STERILIZATION_AREA` positions expose `hospitalUnitName: "CSSD"`
- transaction history rows for internal CSSD-only movements expose `hospitalUnitName: "CSSD"`
- stock card rows for reusable flows show `CSSD` on internal steps and the selected hospital unit on `IN_UNIT` steps

Add expectations to the existing reusable report scenarios instead of creating a separate duplicate scenario.

- [ ] **Step 2: Run test to verify it fails**

Run:

```bash
pnpm vitest run tests/integration/cssd/reports.test.ts
```

Expected: FAIL because `hospitalUnitName` is currently `null` for internal CSSD rows, or stock card expectations do not match.

- [ ] **Step 3: Write minimal implementation**

In `src/lib/cssd/services/reports.ts`, add a shared formatter for unit display:

```ts
const CSSD_INTERNAL_POSITIONS = new Set([
  "READY",
  "NON_STERILE",
  "STERILIZATION_AREA",
]);

function resolveDisplayUnitName(row: {
  hospital_unit_name: string | null;
  from_position: StockPosition | null;
  to_position: StockPosition | null;
}) {
  if (row.hospital_unit_name) {
    return row.hospital_unit_name;
  }

  if (
    (row.to_position && CSSD_INTERNAL_POSITIONS.has(row.to_position)) ||
    (row.from_position && CSSD_INTERNAL_POSITIONS.has(row.from_position))
  ) {
    return "CSSD";
  }

  return null;
}
```

Use that formatter consistently in:

- `mapCurrentStockRow`
- `mapHistoryRow`
- any stock-card-related row mapping path

Keep flow-label logic intact unless the failing test proves the flow label itself is wrong.

- [ ] **Step 4: Run test to verify it passes**

Run:

```bash
pnpm vitest run tests/integration/cssd/reports.test.ts
```

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add tests/integration/cssd/reports.test.ts src/lib/cssd/services/reports.ts
git commit -m "fix: normalize cssd unit labels in reports"
```

### Task 2: Add a focused regression test for stock card route formatting assumptions

**Files:**
- Create: `tests/unit/lib/cssd/report-formatting.test.ts`
- Modify: `src/lib/cssd/services/reports.ts`

- [ ] **Step 1: Write the failing test**

Create a small unit test that verifies a mapped report row returns:

- `hospitalUnitName = "CSSD"` when `hospital_unit_name` is null and the movement is internal CSSD
- actual hospital unit name when `hospital_unit_name` is present

Use direct mapper-level coverage if the mapper can be extracted. If the mapper stays private, test through `listItemStockCardReport` with a small fake `ReportQueryClient`.

- [ ] **Step 2: Run test to verify it fails**

Run:

```bash
pnpm vitest run tests/unit/lib/cssd/report-formatting.test.ts
```

Expected: FAIL before the helper is fully normalized or exported for testing.

- [ ] **Step 3: Write minimal implementation**

If needed, extract a small pure helper inside `reports.ts` such as:

```ts
export function resolveCssdDisplayUnit(...)
```

Only export a helper if it makes the test simpler and keeps `reports.ts` readable.

- [ ] **Step 4: Run test to verify it passes**

Run:

```bash
pnpm vitest run tests/unit/lib/cssd/report-formatting.test.ts
```

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add tests/unit/lib/cssd/report-formatting.test.ts src/lib/cssd/services/reports.ts
git commit -m "test: cover cssd report unit formatting"
```

## Chunk 2: Split The Monolithic Report Page Into Three Routes

### Task 3: Extract the shared report page UI helpers

**Files:**
- Create: `src/components/cssd/reports/section-header.tsx`
- Create: `src/components/cssd/reports/filter-field.tsx`
- Modify: `src/app/(protected)/cssd/laporan/page.tsx`

- [ ] **Step 1: Write the failing test**

No new test is needed for simple presentational extraction. Reuse existing behavior verification later through route page render tests and build.

- [ ] **Step 2: Implement shared helpers**

Move these helpers out of the current monolithic report page:

- `SectionHeader`
- `FilterField`

Use the exact visual classes already present in `src/app/(protected)/cssd/laporan/page.tsx`.

- [ ] **Step 3: Run typecheck to verify the extraction is clean**

Run:

```bash
pnpm exec tsc --noEmit
```

Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add src/components/cssd/reports/section-header.tsx src/components/cssd/reports/filter-field.tsx src/app/\(protected\)/cssd/laporan/page.tsx
git commit -m "refactor: extract shared cssd report ui helpers"
```

### Task 4: Build the dedicated Stok Status report route

**Files:**
- Create: `src/app/(protected)/cssd/laporan/stok-status/page.tsx`
- Reference: `src/app/(protected)/cssd/laporan/page.tsx`
- Reference: `src/components/cssd/transactions/stock-summary-table.tsx`
- Reference: `src/components/cssd/reports/section-header.tsx`
- Reference: `src/components/cssd/reports/filter-field.tsx`

- [ ] **Step 1: Write the failing test**

Prefer a route-level render test only if the repo already has server-page coverage for report pages. If not, rely on focused build verification after implementation and keep this task implementation-first.

- [ ] **Step 2: Write minimal implementation**

Create a dedicated server page that:

- loads `items`, `hospitalUnits`, and `currentStock`
- reads `stockItem` and `stockUnit` from `searchParams`
- renders only the stock-status content section
- uses reset links targeting `/cssd/laporan/stok-status`

Keep the filter names the same as the current page to avoid unnecessary query churn.

- [ ] **Step 3: Run focused verification**

Run:

```bash
pnpm exec tsc --noEmit
```

Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add src/app/\(protected\)/cssd/laporan/stok-status/page.tsx
git commit -m "feat: add cssd stock status report page"
```

### Task 5: Build the dedicated Riwayat Transaksi report route

**Files:**
- Create: `src/app/(protected)/cssd/laporan/riwayat-transaksi/page.tsx`
- Reference: `src/components/cssd/transactions/transaction-history-table.tsx`
- Reference: `src/components/cssd/reports/section-header.tsx`
- Reference: `src/components/cssd/reports/filter-field.tsx`

- [ ] **Step 1: Write the failing test**

Only add a route render test if an equivalent test harness already exists for these server pages. Otherwise defer to build plus manual browser verification.

- [ ] **Step 2: Write minimal implementation**

Create a dedicated server page that:

- loads `items`, `hospitalUnits`, and `transactionHistory`
- reads `historyItem`, `historyUnit`, `historyFrom`, `historyTo` from `searchParams`
- renders only the transaction history section
- maps report rows into `TransactionHistoryTable` rows exactly once
- uses reset links targeting `/cssd/laporan/riwayat-transaksi`

- [ ] **Step 3: Run focused verification**

Run:

```bash
pnpm exec tsc --noEmit
```

Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add src/app/\(protected\)/cssd/laporan/riwayat-transaksi/page.tsx
git commit -m "feat: add cssd transaction history report page"
```

### Task 6: Build the dedicated Kartu Stok report route

**Files:**
- Create: `src/app/(protected)/cssd/laporan/kartu-stok/page.tsx`
- Reference: `src/components/data/data-table.tsx`
- Reference: `src/components/cssd/reports/section-header.tsx`
- Reference: `src/components/cssd/reports/filter-field.tsx`
- Reference: `src/lib/cssd/services/reports.ts`

- [ ] **Step 1: Write the failing test**

Use the report integration coverage from Chunk 1 as the failure proof. No new route test is required unless page-specific rendering breaks.

- [ ] **Step 2: Write minimal implementation**

Create a dedicated server page that:

- loads `items`, `hospitalUnits`, and `stockCard`
- reads `cardItem`, `cardUnit`, `cardFrom`, `cardTo` from `searchParams`
- renders only the stock card section
- uses reset links targeting `/cssd/laporan/kartu-stok`
- preserves the current empty-state behavior:
  - `Pilih item` when no item is selected
  - `Belum ada pergerakan` when item selected but no rows found

- [ ] **Step 3: Run focused verification**

Run:

```bash
pnpm exec tsc --noEmit
```

Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add src/app/\(protected\)/cssd/laporan/kartu-stok/page.tsx
git commit -m "feat: add cssd stock card report page"
```

### Task 7: Convert `/cssd/laporan` into a redirect route

**Files:**
- Modify: `src/app/(protected)/cssd/laporan/page.tsx`

- [ ] **Step 1: Write the failing test**

If no redirect route tests exist in the repo, skip adding one and verify through build plus browser navigation.

- [ ] **Step 2: Write minimal implementation**

Replace the monolithic page with a server redirect:

```ts
import { redirect } from "next/navigation";

export default function LaporanPage() {
  redirect("/cssd/laporan/riwayat-transaksi");
}
```

This keeps direct access to `/cssd/laporan` safe while the sidebar group itself remains non-navigational.

- [ ] **Step 3: Run focused verification**

Run:

```bash
pnpm exec tsc --noEmit
pnpm build
```

Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add src/app/\(protected\)/cssd/laporan/page.tsx
git commit -m "refactor: redirect cssd laporan root to child route"
```

## Chunk 3: Align Sidebar And Header Navigation With The New Report Routes

### Task 8: Convert `Laporan` into a grouped sidebar menu

**Files:**
- Modify: `src/lib/cssd/constants.ts`
- Modify: `src/components/layout/sidebar-nav.tsx`
- Modify: `tests/unit/components/layout/sidebar-nav.test.tsx`

- [ ] **Step 1: Write the failing test**

Extend `tests/unit/components/layout/sidebar-nav.test.tsx` with cases that assert:

- the `Laporan` submenu auto-expands when pathname starts with `/cssd/laporan`
- clicking `Laporan` toggles the submenu
- the submenu contains:
  - `Riwayat Transaksi`
  - `Stok Status`
  - `Kartu Stok`

- [ ] **Step 2: Run test to verify it fails**

Run:

```bash
pnpm vitest run tests/unit/components/layout/sidebar-nav.test.tsx
```

Expected: FAIL because `Laporan` is still a plain link.

- [ ] **Step 3: Write minimal implementation**

Update `CSSD_NAV_ITEMS` to make `Laporan` a `group` item with child routes.

Generalize `SidebarNav` so it can manage both:

- `Master Data`
- `Laporan`

Avoid copy-pasting separate hard-coded render branches if a small reusable grouped-nav pattern can keep the file clearer.

- [ ] **Step 4: Run test to verify it passes**

Run:

```bash
pnpm vitest run tests/unit/components/layout/sidebar-nav.test.tsx
```

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/lib/cssd/constants.ts src/components/layout/sidebar-nav.tsx tests/unit/components/layout/sidebar-nav.test.tsx
git commit -m "feat: group cssd report navigation in sidebar"
```

### Task 9: Add route metadata for report child pages

**Files:**
- Modify: `src/lib/cssd/constants.ts`
- Modify: `src/components/layout/module-header.tsx`
- Create: `tests/unit/components/layout/module-header.test.tsx`

- [ ] **Step 1: Write the failing test**

Create `tests/unit/components/layout/module-header.test.tsx` that mocks `usePathname` and asserts the header title/description for:

- `/cssd/laporan/riwayat-transaksi`
- `/cssd/laporan/stok-status`
- `/cssd/laporan/kartu-stok`

If mocking the whole component is awkward, extract the route-meta resolver into a small pure helper and test that helper directly.

- [ ] **Step 2: Run test to verify it fails**

Run:

```bash
pnpm vitest run tests/unit/components/layout/module-header.test.tsx
```

Expected: FAIL because route metadata still falls back to the generic `/cssd` or `/cssd/laporan` entry.

- [ ] **Step 3: Write minimal implementation**

Add `CSSD_ROUTE_META` entries for the three report child paths and update `getRouteMeta` so:

- `/cssd/master-data/...` still falls back to the item page meta
- `/cssd/laporan/...` resolves to the exact child route meta
- generic `/cssd` fallback stays as the last resort

- [ ] **Step 4: Run test to verify it passes**

Run:

```bash
pnpm vitest run tests/unit/components/layout/module-header.test.tsx
```

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/lib/cssd/constants.ts src/components/layout/module-header.tsx tests/unit/components/layout/module-header.test.tsx
git commit -m "feat: add cssd report child route metadata"
```

### Task 10: Run final verification for the full feature

**Files:**
- Verify only

- [ ] **Step 1: Run focused unit and integration tests**

Run:

```bash
pnpm vitest run tests/integration/cssd/reports.test.ts tests/unit/components/layout/sidebar-nav.test.tsx tests/unit/components/layout/module-header.test.tsx tests/unit/lib/cssd/report-formatting.test.ts
```

Expected: PASS

- [ ] **Step 2: Run typecheck and build**

Run:

```bash
pnpm exec tsc --noEmit
pnpm build
```

Expected: PASS

- [ ] **Step 3: Manual browser verification**

Check these flows in the running app:

- `Laporan` sidebar entry only expands/collapses
- `/cssd/laporan/riwayat-transaksi` loads and shows filters
- `/cssd/laporan/stok-status` loads and shows `CSSD` in internal rows
- `/cssd/laporan/kartu-stok` shows full reusable flow including CSSD-owned rows
- direct access to `/cssd/laporan` redirects to `/cssd/laporan/riwayat-transaksi`

- [ ] **Step 4: Commit**

```bash
git add .
git commit -m "feat: split cssd reports and normalize cssd stock labels"
```

---

Plan complete and saved to `docs/superpowers/plans/2026-06-30-cssd-report-navigation-and-stock-labels.md`. Ready to execute?
