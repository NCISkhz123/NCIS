# CSSD Report Navigation And Stock Labels Design

Date: 2026-06-30
Project: NCIS CSSD MVP
Status: Draft for user review

## Summary

This design updates CSSD reporting to match the existing grouped navigation style used by Master Data, makes internal CSSD stock locations display the unit label `CSSD`, and fixes item stock card behavior so internal CSSD movements and unit-based movements appear consistently.

The user-approved direction is:

- `Laporan` behaves as a grouped sidebar item with show/hide only
- Reporting is split into three dedicated pages:
  - `/cssd/laporan/riwayat-transaksi`
  - `/cssd/laporan/stok-status`
  - `/cssd/laporan/kartu-stok`
- Internal CSSD positions (`READY`, `NON_STERILE`, `STERILIZATION_AREA`) display `CSSD` as the unit label across report views

## Goals

- Make reporting easier to navigate by separating concerns into dedicated pages
- Align `Laporan` navigation behavior with the existing `Master Data` grouped menu
- Ensure stock rows and movement rows clearly show whether inventory is in CSSD or in a hospital unit
- Make stock card output reliable for reusable flows that move between CSSD and units

## Non-Goals

- No new dashboard or aggregate landing page for reporting
- No redesign of non-CSSD modules
- No change to core stock mutation RPC behavior unless debugging proves the bug is there

## Current Problems

### 1. Reporting is overloaded into one page

The current `/cssd/laporan` page mixes:

- current stock snapshot
- transaction history
- stock card

This creates a long page, duplicates filter concerns, and does not match the grouped menu pattern already used elsewhere.

### 2. Internal CSSD stock rows show empty or generic unit values

When inventory is in internal CSSD-controlled positions, the unit label may render as `-` or blank because there is no `hospital_unit_id`. This makes it harder to distinguish:

- stock stored inside CSSD
- stock assigned to a hospital unit

### 3. Stock card behavior is not reliable

Based on the user report and current implementation shape, the stock card likely under-represents internal CSSD movements because:

- report output is unit-oriented
- rows with `hospital_unit_id = null` are not formatted as CSSD-owned flow
- flow labeling and unit labeling are not centralized for report rows

## Proposed Design

## 1. Reporting Route Structure

Replace the single reporting experience with three focused pages:

- `/cssd/laporan/riwayat-transaksi`
- `/cssd/laporan/stok-status`
- `/cssd/laporan/kartu-stok`

`/cssd/laporan` becomes a technical route only. It should redirect to one report child route for direct URL access, but the sidebar group button itself should only expand/collapse and should not navigate.

### Why this structure

- matches the existing grouped navigation behavior in CSSD
- gives each report page a single clear purpose
- reduces filter collisions between unrelated report sections
- improves maintainability and testability

## 2. Sidebar Navigation Behavior

Update CSSD navigation so `Laporan` becomes a grouped item like `Master Data`.

Expected behavior:

- clicking `Laporan` toggles show/hide only
- submenu shows:
  - `Riwayat Transaksi`
  - `Stok Status`
  - `Kartu Stok`
- active styling follows the current nested navigation pattern
- if the current pathname starts with `/cssd/laporan`, the group auto-opens

## 3. Route Metadata And Header Behavior

Update route metadata so `ModuleHeader` resolves titles and descriptions for:

- `/cssd/laporan/riwayat-transaksi`
- `/cssd/laporan/stok-status`
- `/cssd/laporan/kartu-stok`

The generic `/cssd/laporan` metadata can stay only as fallback or redirect context.

## 4. Unit Labeling Rule For Internal CSSD Positions

Introduce a shared formatting rule at the reporting/read-model layer:

- if stock or movement belongs to CSSD internal positions, show unit label `CSSD`
- this applies even when `hospital_unit_id` is null

Positions covered:

- `READY`
- `NON_STERILE`
- `STERILIZATION_AREA`

### Display impact

- Stock status page:
  - rows in internal CSSD positions show `CSSD`
- Transaction history page:
  - rows that land in or originate from internal CSSD flow show `CSSD` in the unit-related column when no hospital unit is involved
- Stock card page:
  - internal CSSD steps are visible as CSSD-owned movements instead of blank unit rows

## 5. Report Page Responsibilities

### Riwayat Transaksi

Purpose:

- show movement history with filters for item, unit, and date range

Primary data:

- transaction history report rows

Expected filters:

- item
- unit
- from date
- to date

### Stok Status

Purpose:

- show current active stock grouped by item, position, and unit context

Primary data:

- current stock report rows

Expected filters:

- item
- unit

### Kartu Stok

Purpose:

- show detailed movement trail for one selected item

Primary data:

- item stock card report rows

Expected filters:

- required item
- optional unit
- optional from date
- optional to date

## 6. Stock Card Debugging Hypothesis

Current working hypothesis:

- the stock card is not consistently representing CSSD-owned rows because rows with no hospital unit are not normalized into a CSSD display label
- if an item flow transitions across internal CSSD positions and units, the current formatting does not make the ownership context obvious enough

Validation approach:

- inspect `listItemStockCardReport`
- verify raw report rows against `stock_movements`
- add regression coverage for a reusable flow:
  - receipt into `READY`
  - distribution to unit
  - return into `NON_STERILE`
  - transfer into `STERILIZATION_AREA`
  - transfer back into `READY`

Expected result:

- all five stages appear in order
- CSSD-owned steps show `CSSD`
- unit-owned steps show the selected hospital unit name

## 7. Components And File Changes

Likely touch points:

- `src/lib/cssd/constants.ts`
  - grouped navigation for `Laporan`
  - route metadata additions
- `src/components/layout/sidebar-nav.tsx`
  - second grouped menu state for `Laporan`
- `src/components/layout/module-header.tsx`
  - report child route metadata resolution
- `src/app/(protected)/cssd/laporan/...`
  - split the current monolithic page into dedicated routes
- `src/lib/cssd/services/reports.ts`
  - centralize CSSD unit label formatting
  - debug and correct stock card mapping
- shared report table helpers/components if needed for reuse

## 8. Data Flow

### Stock Status

1. Request reaches `/cssd/laporan/stok-status`
2. Query params are normalized
3. `listCurrentStockReport` loads rows
4. formatter injects `CSSD` label for internal positions when no hospital unit exists
5. UI table renders normalized rows

### Riwayat Transaksi

1. Request reaches `/cssd/laporan/riwayat-transaksi`
2. Query params are normalized
3. `listTransactionHistoryReport` loads rows
4. formatter resolves flow label plus unit display label
5. UI renders filtered history table

### Kartu Stok

1. Request reaches `/cssd/laporan/kartu-stok`
2. selected item and optional filters are normalized
3. `listItemStockCardReport` loads rows
4. formatter resolves CSSD versus hospital-unit ownership display
5. UI renders item-specific movement trail

## 9. Error Handling

- If report queries fail, pages continue rendering with empty-state tables
- If no stock card item is selected, the page shows an instructional empty state
- If selected filters return no rows, the page shows explicit empty-state messages rather than ambiguous blanks

## 10. Testing Strategy

Add or update tests for:

- grouped sidebar navigation behavior for `Laporan`
- route metadata selection for report child pages
- stock status row formatting showing `CSSD` for internal positions
- transaction history formatting showing `CSSD` when applicable
- stock card report mapping across CSSD and unit flows
- regression case proving item stock card includes reusable internal transitions

## Recommended Implementation Order

1. Normalize reporting format rules in report services
2. Fix stock card behavior with regression tests
3. Split report routes into dedicated pages
4. Update sidebar and header metadata for grouped report navigation
5. Run focused tests plus typecheck and build
