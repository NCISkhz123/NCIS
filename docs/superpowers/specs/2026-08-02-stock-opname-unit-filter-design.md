# Design Specification: Stok Opname Unit Scope Filter

**Date:** 2026-08-02
**Status:** Approved

## Overview

Enhance the Stock Opname flow in both CSSD and Laundry modules to allow scoping a draft stock opname session either globally ("Seluruh Unit") or to a specific hospital unit ("1 Unit Spesifik").

## Requirements

1. **Session Scope Selection**: When starting a new stock opname session, users can choose:
   - "Seluruh Unit (Global)" (default, `hospital_unit_id` is `NULL`)
   - A specific hospital unit (e.g. "Unit Bedah", `hospital_unit_id` is set to that unit's UUID).
2. **UI Adaptations**:
   - The "Mulai Sesi" form includes a Unit Scope dropdown populated with active hospital units.
   - Active session cards display the target unit scope (e.g. `Cakupan: Unit Bedah` or `Cakupan: Seluruh Unit (Global)`).
   - In active draft sessions created for a specific unit, the line input form pre-fills and locks (`disabled`) the "Unit Terkait" field to that unit and automatically selects position `IN_UNIT`.
3. **Database Schema & RPC**:
   - `stock_opname_sessions` and `laundry_stock_opname_sessions` tables get a nullable `hospital_unit_id` UUID column.
   - RPC functions (`cssd_create_stock_opname_session`, `laundry_create_stock_opname_session`) accept `p_hospital_unit_id`.
   - RPC functions (`cssd_save_stock_opname_line`, `laundry_save_stock_opname_line`) enforce unit consistency when session has a specific unit scope.

## Schema & Migration

```sql
-- Migration: 202608020001_stock_opname_unit_scope.sql

alter table public.stock_opname_sessions
  add column if not exists hospital_unit_id uuid references public.hospital_units(id) on delete set null;

alter table public.laundry_stock_opname_sessions
  add column if not exists hospital_unit_id uuid references public.laundry_hospital_units(id) on delete set null;
```

## Backward Compatibility

Existing sessions with `hospital_unit_id IS NULL` represent global ("Seluruh Unit") opnames, ensuring 100% backward compatibility.
