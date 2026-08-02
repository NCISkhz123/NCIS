# Vitest Local Speed Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Membuat jalur default unit test lebih cepat di environment lokal Windows tanpa memindahkan folder project, sambil tetap menyediakan fallback kompatibilitas.

**Architecture:** Jadikan konfigurasi Vitest default lebih ramah performa dengan `threads` dan file parallelism aktif, lalu sediakan script `test:unit:compat` yang memaksa mode lambat/aman untuk debugging atau library yang tidak thread-safe. Lindungi kontrak ini dengan test tooling yang membaca `vitest.config.ts` dan `package.json`.

**Tech Stack:** Vitest 4, TypeScript, pnpm

---

### Task 1: Lock the expected test-runner contract

**Files:**
- Create: `tests/unit/tooling/vitest-runner-config.test.ts`

- [ ] **Step 1: Write the failing test**
- [ ] **Step 2: Run the tooling test to verify it fails**
- [ ] **Step 3: Update config and scripts minimally**
- [ ] **Step 4: Run the tooling test to verify it passes**

### Task 2: Wire the faster default and fallback script

**Files:**
- Modify: `vitest.config.ts`
- Modify: `package.json`
- Modify: `README.md`

- [ ] **Step 1: Set the default Vitest pool to `threads`**
- [ ] **Step 2: Remove forced serial-only defaults from config**
- [ ] **Step 3: Add `test:unit:compat` for the serial/forks fallback**
- [ ] **Step 4: Update docs so local commands match the repo behavior**

### Task 3: Verify the change end to end

**Files:**
- Test: `tests/unit/tooling/vitest-runner-config.test.ts`

- [ ] **Step 1: Run the focused tooling test**
- [ ] **Step 2: Run `pnpm lint`**
- [ ] **Step 3: Run `pnpm typecheck`**
- [ ] **Step 4: Run `pnpm test:unit`**
