# Stock Opname Unit Filter Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Allow users to scope a draft stock opname session to either "Seluruh Unit (Global)" or a specific hospital unit in both CSSD and Laundry modules.

**Architecture:** Add `hospital_unit_id` column to `stock_opname_sessions` and `laundry_stock_opname_sessions` tables. Update Supabase RPC functions (`cssd_create_stock_opname_session`, `laundry_create_stock_opname_session`, line saving RPCs), TypeScript services/validators, Server Actions, and React components (`StockOpnameView`) to capture, display, and enforce unit scope.

**Tech Stack:** Next.js (App Router, Server Actions, React Server/Client Components), TypeScript, Supabase PostgreSQL / PL/pgSQL, Vitest.

## Global Constraints

- Preserve 100% backward compatibility: `hospital_unit_id NULL` represents "Seluruh Unit (Global)".
- Modifying conditional logic must maintain existing validation contracts.
- Both CSSD and Laundry modules must receive identical unit scope capability.

---

### Task 1: Database Migration and RPC Updates

**Files:**
- Create: `supabase/migrations/202608020001_stock_opname_unit_scope.sql`

**Interfaces:**
- Consumes: Existing tables `public.stock_opname_sessions`, `public.laundry_stock_opname_sessions`, `public.hospital_units`, `public.laundry_hospital_units`
- Produces: Updated SQL functions `public.cssd_create_stock_opname_session`, `public.laundry_create_stock_opname_session`, `public.cssd_save_stock_opname_line`, `public.laundry_save_stock_opname_line`

- [ ] **Step 1: Write migration SQL file**

```sql
-- Migration: 202608020001_stock_opname_unit_scope.sql

alter table public.stock_opname_sessions
  add column if not exists hospital_unit_id uuid references public.hospital_units(id) on delete set null;

alter table public.laundry_stock_opname_sessions
  add column if not exists hospital_unit_id uuid references public.laundry_hospital_units(id) on delete set null;

-- CSSD RPC create session update
create or replace function public.cssd_create_stock_opname_session(
  p_opname_date date,
  p_notes text default null,
  p_hospital_unit_id uuid default null,
  p_actor_user_id uuid default auth.uid()
)
returns jsonb
language plpgsql
set search_path = public
as $$
declare
  v_existing_draft_id uuid;
  v_session_id uuid;
begin
  select id
  into v_existing_draft_id
  from public.stock_opname_sessions
  where status = 'DRAFT'
  order by created_at desc
  limit 1;

  if v_existing_draft_id is not null then
    raise exception 'draft stock opname session already exists';
  end if;

  insert into public.stock_opname_sessions (
    opname_date,
    status,
    notes,
    hospital_unit_id,
    created_by
  )
  values (
    p_opname_date,
    'DRAFT',
    p_notes,
    p_hospital_unit_id,
    p_actor_user_id
  )
  returning id into v_session_id;

  return jsonb_build_object(
    'id', v_session_id,
    'status', 'DRAFT',
    'opname_date', p_opname_date,
    'notes', p_notes,
    'hospital_unit_id', p_hospital_unit_id,
    'line_count', 0
  );
end;
$$;

-- Laundry RPC create session update
create or replace function public.laundry_create_stock_opname_session(
  p_opname_date date,
  p_notes text default null,
  p_hospital_unit_id uuid default null,
  p_actor_user_id uuid default auth.uid()
)
returns jsonb
language plpgsql
set search_path = public
as $$
declare
  v_existing_draft_id uuid;
  v_session_id uuid;
begin
  select id
  into v_existing_draft_id
  from public.laundry_stock_opname_sessions
  where status = 'DRAFT'
  order by created_at desc
  limit 1;

  if v_existing_draft_id is not null then
    raise exception 'draft stock opname session already exists';
  end if;

  insert into public.laundry_stock_opname_sessions (
    opname_date,
    status,
    notes,
    hospital_unit_id,
    created_by
  )
  values (
    p_opname_date,
    'DRAFT',
    p_notes,
    p_hospital_unit_id,
    p_actor_user_id
  )
  returning id into v_session_id;

  return jsonb_build_object(
    'id', v_session_id,
    'status', 'DRAFT',
    'opname_date', p_opname_date,
    'notes', p_notes,
    'hospital_unit_id', p_hospital_unit_id,
    'line_count', 0
  );
end;
$$;
```

- [ ] **Step 2: Verify SQL syntax and file creation**

Run: Check migration file exists at `supabase/migrations/202608020001_stock_opname_unit_scope.sql`.

- [ ] **Step 3: Commit migration**

```bash
git add supabase/migrations/202608020001_stock_opname_unit_scope.sql
git commit -m "feat(db): add hospital_unit_id scope to stock opname sessions"
```

---

### Task 2: Service Layer and Validators Update

**Files:**
- Modify: `src/lib/cssd/validators/stock-opname.ts`
- Modify: `src/lib/cssd/services/stock-opname.ts`
- Modify: `src/lib/laundry/services/stock-opname.ts`
- Test: `tests/integration/cssd/stock-opname.test.ts`
- Test: `tests/integration/laundry/stock-opname.test.ts`

**Interfaces:**
- Consumes: Supabase RPC client, Zod validation
- Produces: `StockOpnameSessionSummary` with `hospitalUnitId` and `hospitalUnitName`, `createDraftStockOpnameSession` accepting `hospitalUnitId`

- [ ] **Step 1: Update Zod validation schema in `src/lib/cssd/validators/stock-opname.ts`**

Add `hospitalUnitId` to `stockOpnameDraftSchema`:

```typescript
export const stockOpnameDraftSchema = z.object({
  opnameDate: z.coerce.date(),
  notes: z.string().trim().max(500).optional(),
  hospitalUnitId: z.string().uuid("Unit tidak valid").optional().nullable(),
});
```

- [ ] **Step 2: Update CSSD Service (`src/lib/cssd/services/stock-opname.ts`)**

Update `StockOpnameSessionSummary` type and RPC callers to handle `hospitalUnitId` and `hospitalUnitName`.

```typescript
export type StockOpnameSessionSummary = {
  id: string;
  opnameDate: string;
  status: "DRAFT" | "FINALIZED";
  notes: string | null;
  hospitalUnitId: string | null;
  hospitalUnitName: string | null;
  lineCount: number;
};
```

Update `createDraftStockOpnameSession`, `getDraftStockOpnameSession`, and `listRecentStockOpnameSessions` queries to select `hospital_unit_id, hospital_units(name)`.

- [ ] **Step 3: Update Laundry Service (`src/lib/laundry/services/stock-opname.ts`)**

Apply matching updates to Laundry service types and functions for `hospitalUnitId` and `hospitalUnitName` (selecting `hospital_unit_id, laundry_hospital_units(name)`).

- [ ] **Step 4: Run integration tests to verify**

Run: `npx vitest run tests/integration/cssd/stock-opname.test.ts tests/integration/laundry/stock-opname.test.ts`
Expected: PASS

- [ ] **Step 5: Commit service changes**

```bash
git add src/lib/cssd/validators/stock-opname.ts src/lib/cssd/services/stock-opname.ts src/lib/laundry/services/stock-opname.ts
git commit -m "feat(services): update stock opname services to handle hospitalUnitId scope"
```

---

### Task 3: Server Actions Updates

**Files:**
- Modify: `src/app/(protected)/cssd/stok-opname/actions.ts`
- Modify: `src/app/(protected)/laundry/stok-opname/actions.ts`
- Modify: `src/lib/cssd/forms/transactions.ts`
- Modify: `src/lib/laundry/forms/transactions.ts`

**Interfaces:**
- Consumes: `createDraftStockOpnameSession`
- Produces: `createStockOpnameDraftAction` supporting `hospitalUnitId` form input

- [ ] **Step 1: Update form state types in `src/lib/cssd/forms/transactions.ts` & `src/lib/laundry/forms/transactions.ts`**

Add `hospitalUnitId` to `StockOpnameDraftFormValues`:

```typescript
export type StockOpnameDraftFormValues = {
  opnameDate?: string;
  notes?: string;
  hospitalUnitId?: string;
};
```

- [ ] **Step 2: Update Server Action in `src/app/(protected)/cssd/stok-opname/actions.ts`**

Extract `hospitalUnitId` from `formData`:

```typescript
const opnameDate = String(formData.get("opnameDate") ?? "");
const notes = String(formData.get("notes") ?? "");
const hospitalUnitId = String(formData.get("hospitalUnitId") ?? "");

const result = await createDraftStockOpnameSession(client, {
  opnameDate,
  notes,
  hospitalUnitId: hospitalUnitId || null,
});
```

- [ ] **Step 3: Update Server Action in `src/app/(protected)/laundry/stok-opname/actions.ts`**

Apply the matching change for Laundry `createStockOpnameDraftAction`.

- [ ] **Step 4: Run unit tests for server action exports**

Run: `npx vitest run tests/unit/app/cssd/server-action-exports.test.ts tests/unit/app/laundry/server-action-exports.test.ts`
Expected: PASS

- [ ] **Step 5: Commit server action updates**

```bash
git add src/lib/cssd/forms/transactions.ts src/lib/laundry/forms/transactions.ts src/app/\(protected\)/cssd/stok-opname/actions.ts src/app/\(protected\)/laundry/stok-opname/actions.ts
git commit -m "feat(actions): pass hospitalUnitId from form data in stock opname draft creation"
```

---

### Task 4: UI Components Update

**Files:**
- Modify: `src/components/cssd/transactions/stock-opname-view.tsx`
- Modify: `src/components/laundry/transactions/stock-opname-view.tsx`

**Interfaces:**
- Consumes: `StockOpnameViewProps` (includes `hospitalUnits`), `draftSession` (includes `hospitalUnitId`, `hospitalUnitName`)
- Produces: Unit Scope dropdown in "Mulai Sesi" form, unit scope badge display, pre-filled locked unit field in line input form

- [ ] **Step 1: Update "Mulai Sesi" form in `StockOpnameView` (`src/components/cssd/transactions/stock-opname-view.tsx`)**

Add Unit Scope `<Select>` element:

```tsx
<div className="grid gap-1.5">
  <label
    htmlFor="opname-unit-scope"
    className="text-xs font-semibold uppercase tracking-wider text-slate-800"
  >
    Cakupan Unit
  </label>
  <Select
    id="opname-unit-scope"
    name="hospitalUnitId"
    defaultValue={draftValues.hospitalUnitId ?? ""}
    disabled={draftPending}
  >
    <option value="">Seluruh Unit (Global)</option>
    {hospitalUnits.map((unit) => (
      <option key={unit.id} value={unit.id}>
        {unit.name} ({unit.code})
      </option>
    ))}
  </Select>
</div>
```

- [ ] **Step 2: Update Active Session Card and Input Line Form**

- Show badge: `Cakupan: {draftSession.hospitalUnitName ?? "Seluruh Unit (Global)"}`.
- In line form, if `draftSession.hospitalUnitId` is present:
  - Default `hospitalUnitId` select value to `draftSession.hospitalUnitId`.
  - Set `disabled` or add a hidden input if disabled so value is posted.
  - Automatically default `stockPosition` to `IN_UNIT`.

- [ ] **Step 3: Update Laundry `StockOpnameView` (`src/components/laundry/transactions/stock-opname-view.tsx`)**

Apply matching updates for Laundry UI view component.

- [ ] **Step 4: Run component tests**

Run: `npx vitest run tests/unit/components/cssd/remaining-transaction-pages.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit UI updates**

```bash
git add src/components/cssd/transactions/stock-opname-view.tsx src/components/laundry/transactions/stock-opname-view.tsx
git commit -m "feat(ui): add hospital unit scope dropdown and pre-fill logic to stock opname view"
```

---

### Task 5: Final Verification

- [ ] **Step 1: Run all unit and integration tests across project**

Run: `npm test`
Expected: PASS

- [ ] **Step 2: Run build check**

Run: `npm run build`
Expected: Successful Next.js build with zero TypeScript or syntax errors.
