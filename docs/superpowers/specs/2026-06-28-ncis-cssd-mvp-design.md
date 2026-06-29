# NCIS CSSD MVP Design

Date: 2026-06-28
Product: NCIS (Non Clinical Integrated System)
Module: CSSD
Status: Draft approved for planning

## 1. Overview

This document defines the MVP design for the CSSD module of NCIS. NCIS is planned as a modular non-clinical hospital web application. The first delivery phase focuses only on CSSD so the team can establish a stable operational and technical foundation before expanding to Laundry and Ambulance.

The CSSD MVP is designed to support day-to-day warehouse and circulation recording for reusable items and selected consumables. The system prioritizes simple operational flows, accurate stock balances, and a complete stock movement history for audit and reporting.

## 2. Goals

- Build the first production foundation of NCIS as a modular web application.
- Deliver a usable CSSD workflow without unnecessary complexity.
- Support separated stock handling for reusable items, consumables distributed to units, and consumables used internally by CSSD.
- Maintain both current stock balances and a complete stock card history.
- Keep the UI simple for early operational adoption.

## 3. Non-Goals

- No Laundry implementation in phase 1.
- No Ambulance implementation in phase 1.
- No dashboard in the first release.
- No per-batch, lot, or expiration tracking in MVP.
- No supplier management in MVP.
- No unit-side self-service request workflow in MVP.
- No per-unit active stock tracking for consumable distribution in MVP.
- No sterilization cycle traceability linked to detailed process records in MVP.

## 4. User Roles

The MVP supports two roles:

- Admin CSSD
- Petugas CSSD

Operational assumption for phase 1:

- Requests or service needs from hospital units are still entered and handled by CSSD staff.

## 5. Tech Stack Direction

- Frontend and app framework: Next.js
- UI system: shadcn/ui
- Database and backend platform: Supabase Postgres
- Deployment target: Vercel + Supabase Cloud
- Documentation lookup policy during implementation: Context7-first
- UI workflow requirement during implementation: use UI Skills workflow, including `npx ui-skills start` before UI work

## 6. Information Architecture

There is no dashboard in MVP.

Top-level menu:

- Master Data
- Pemasukan
- Distribusi
- Pengembalian
- Pemakaian Internal
- Stok Opname
- Laporan

Master Data submenu:

- Item
- Satuan
- Unit

Shell navigation behavior:

- `Master Data` behaves as an accordion menu
- clicking `Master Data` expands `Item`, `Satuan`, and `Unit`
- clicking `Master Data` again collapses the submenu
- module switching is placed in the global header, not inside the sidebar

## 7. Master Data Scope

### 7.1 Item

Each item must have at least:

- Item code
- Item name
- Unit of measure
- Item type
- Active status

Item code behavior:

- Generated automatically by the system
- Can be edited manually

### 7.2 Satuan

Reference table for unit of measure used by items and transactions.

### 7.3 Unit

Reference table for hospital units that receive distributed items.

## 8. Item Types

The MVP supports three item types:

- Reusable
- Consumable Distribution
- Consumable Internal

Definitions:

- Reusable: item circulates between CSSD and units and may require resterilization before becoming ready again
- Consumable Distribution: item is stocked in CSSD and distributed to units, but is not tracked as active stock per unit after leaving CSSD
- Consumable Internal: item is stocked in CSSD and consumed internally by CSSD, for example chemical sterilizer

## 9. Stock Model

The system must maintain two complementary layers:

- Current stock balances for fast operational use
- Full stock movement history for audit and reporting

### 9.1 Reusable stock positions

Reusable items use the following operational positions:

- Siap Pakai
- Di Unit
- Tidak Steril
- Area Sterilisasi
- Rusak

Meaning:

- Siap Pakai: reusable stock available for distribution
- Di Unit: reusable items currently out in units
- Tidak Steril: reusable items returned but not yet ready for use
- Area Sterilisasi: reusable items currently being processed
- Rusak: reusable items no longer usable

### 9.2 Consumable stock positions

For MVP simplicity:

- Consumable Distribution and Consumable Internal primarily use CSSD ready stock before they leave through their respective transactions
- Consumable Distribution is not tracked as active stock at unit level after distribution
- Consumable Internal is reduced through internal usage transactions

## 10. Core Transactions

The MVP includes the following transaction menus:

- Pemasukan
- Distribusi
- Pengembalian
- Pemakaian Internal
- Stok Opname

### 10.1 Pemasukan

Purpose:

- Record stock entering CSSD

Expected effect:

- Increase stock balance
- Create stock movement entries

Typical behavior:

- Reusable enters Siap Pakai
- Consumables enter ready CSSD stock

### 10.2 Distribusi

Purpose:

- Record stock leaving CSSD to a hospital unit

Expected effect:

- Reusable: move from Siap Pakai to Di Unit
- Consumable Distribution: reduce CSSD stock and record target unit
- Create stock movement entries

Constraint:

- Distribution is entered directly by CSSD staff
- There is no unit request workflow in MVP

### 10.3 Pengembalian

Purpose:

- Record reusable items returned from units

Expected effect:

- Reusable items do not automatically return to Siap Pakai
- Returned reusable items can move into Tidak Steril or Rusak depending on condition
- Create stock movement entries

Scope rule:

- Pengembalian is primarily for Reusable items

### 10.4 Pemakaian Internal

Purpose:

- Record CSSD internal usage for internal consumables

Expected effect:

- Reduce CSSD stock
- Create stock movement entries

Minimal input:

- item
- quantity
- date
- notes

### 10.5 Stok Opname

Purpose:

- Record stock checking sessions and finalize stock adjustments

Expected effect:

- draft entry does not directly change stock
- finalization creates stock adjustment movements and updates balances

### 10.6 Riwayat transaksi

Purpose:

- Let CSSD staff review operational stock movement history without opening a separate dashboard

Filter behavior:

- support filter by one date
- support filter by date range

## 11. Reusable Operational Flows

### 11.1 Standard circulation

Reusable default lifecycle:

1. Pemasukan to Siap Pakai
2. Distribusi to Di Unit
3. Pengembalian to Tidak Steril
4. Move to Area Sterilisasi
5. Move back to Siap Pakai

### 11.2 Damaged reusable flow

If condition is not acceptable:

1. Item returns from unit
2. Item is marked Rusak
3. Stock movement history records the transition

### 11.3 Internal transfer behavior

Although the menu structure focuses on core business transactions, the data model must support internal reusable movement between:

- Tidak Steril -> Area Sterilisasi
- Area Sterilisasi -> Siap Pakai
- Any valid origin -> Rusak

Implementation detail can be expressed later either as dedicated internal actions inside the reusable flow or as specialized transaction actions within the CSSD module.

## 12. Reporting Scope

MVP reports:

- Stok Saat Ini
- Riwayat Transaksi
- Kartu Stok per Item

### 12.1 Stok Saat Ini

Must allow users to view current balances. For reusable items, balances should be understandable by operational position.

### 12.2 Riwayat Transaksi

Must present chronological transaction history across the module.

Recommended MVP filter support:

- one-date filter
- date-range filter

### 12.3 Kartu Stok per Item

Must provide item-level movement traceability suitable for audit and operational checking.

## 13. Data Model Direction

This section describes the intended core tables and responsibilities, not final migration syntax.

### 13.1 Reference tables

- `users`
- `units_of_measure`
- `hospital_units`
- `items`

### 13.2 Stock tables

- `stock_balances`
- `stock_movements`

### 13.3 Transaction tables

- `receipts`
- `distributions`
- `returns`
- `internal_usages`
- `stock_opname_sessions`
- `stock_opname_lines`

### 13.4 Item fields

Suggested minimum fields for `items`:

- `id`
- `code`
- `name`
- `uom_id`
- `item_type`
- `is_active`
- timestamps

Suggested values for `item_type`:

- `REUSABLE`
- `CONSUMABLE_DISTRIBUTION`
- `CONSUMABLE_INTERNAL`

### 13.5 Stock balance fields

Suggested responsibility for `stock_balances`:

- Store current quantity per item
- Support quantity by logical stock position where applicable
- Serve fast operational reads

### 13.6 Stock movement fields

Suggested minimum stock movement concepts:

- item reference
- date/time
- movement type
- quantity
- source position
- destination position
- related transaction id
- related unit when relevant
- actor/user
- notes

The stock movement table is the authoritative audit trail.

## 14. Business Rules

- All stock-changing transactions must write to stock movements.
- Stock balances are updated through approved transaction flows, not direct manual edits.
- Stock movement records must be treated as audit data and should not be freely edited after creation.
- Transactions must reject quantity larger than available stock in the origin position.
- Pengembalian should only allow Reusable items.
- Pemakaian Internal should only allow Consumable Internal items.
- Distributions for Consumable Distribution record the destination unit but do not create tracked active stock per unit.
- Stok Opname draft does not affect balances.
- Stok Opname finalization creates adjustment movements and updates balances.

## 15. Page Pattern

CSSD pages should use a consistent working pattern so operational staff do not need to relearn the interface per menu.

Base pattern:

- page title and short description at the top
- main working area centered on one table or list
- inline form, side panel, or lightweight drawer for create and update flows
- success and failure feedback shown near the relevant form or data area

Per-page pattern:

- Master Data: data table plus compact inline form
- Pemasukan: transaction form first, recent history below
- Distribusi: transaction form first, recent history below
- Pengembalian: transaction form first, recent history below
- Pemakaian Internal: transaction form first, recent history below
- Stok Opname: session header, opname lines, and finalization action
- Laporan: one page with sections or tabs instead of many separate routes

## 16. UI Direction

The MVP should prioritize clarity over decoration, while still presenting NCIS as a polished internal product.

UI principles:

- clinical modern visual direction
- bright, high-contrast workspace
- stable left sidebar for active-module navigation
- fast transaction entry
- consistent table and form patterns
- clear stock position labels for reusable items
- minimal click depth for operational workflows

Shell direction:

- `NCIS` is displayed prominently in the sidebar
- `Non Clinical Integrated System` is shown directly below the NCIS label
- the active module label remains visible as context
- CSSD sidebar focuses only on CSSD menus
- module switching for CSSD, Laundry, and Ambulance is placed in the global header
- `Master Data` behaves as an accordion menu

Shared UI components:

- `AppSidebar`
- `SidebarNav`
- `ModuleHeader`
- `DataTable`
- `EmptyState`
- `FormError`

UI feedback rules:

- validation errors appear near fields or form sections
- business rule failures appear as concise inline operational messages
- routine success and failure feedback does not require modal dialogs

Implementation requirement:

- UI work should follow UI Skills workflow and run `npx ui-skills start` before UI-focused implementation

Interaction and data flow:

- `page.tsx` loads initial server data
- `actions.ts` stays thin and only handles form submission entry points
- CSSD service modules own business validation and orchestration
- atomic stock changes remain owned by database transaction functions
- after submit, the page should surface inline feedback and refresh relevant data views

## 17. Security and Access Direction

Initial access model is intentionally small:

- Admin CSSD
- Petugas CSSD

Detailed permission mapping can be refined during implementation planning, but the data and route structure should be prepared for role-aware access.

## 18. Testing Direction

The first implementation plan should cover:

- protected shell and CSSD navigation smoke validation
- working accordion behavior for `Master Data`
- master data page interaction and server action wiring
- Reference data CRUD validation
- Transaction validation by item type
- Stock balance updates
- Stock movement creation
- Reusable position transitions
- Stok Opname draft vs finalization behavior
- Reporting correctness for current stock and stock card

## 19. Expansion Readiness

This design intentionally keeps phase 1 focused on CSSD while preparing for future growth:

- NCIS remains one modular app
- Future Laundry can reuse selected inventory patterns but must keep separate stock and transaction domains
- Future Ambulance can live in the same app with separate module boundaries

## 20. Open Implementation Decisions

These items can be finalized during planning and implementation without changing the approved product scope:

- Exact route naming and folder structure in Next.js
- Exact Supabase auth strategy and role mapping
- Whether internal reusable transfers become their own menu or embedded actions
- Exact code generation format for item codes
- Filtering, pagination, and export behavior for reports

## 21. Recommendation

Proceed with implementation planning for the CSSD MVP as the first NCIS module. The design is intentionally simple enough for a first release, while preserving the stock and transaction foundations needed for future operational growth.
