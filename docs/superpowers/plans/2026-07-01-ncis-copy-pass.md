# NCIS copy pass Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Merapikan seluruh copy NCIS agar terasa singkat, operasional, dan bebas bahasa teknis di login, shell, CSSD, dan Laundry.

**Architecture:** Pass ini berfokus pada microcopy, bukan perubahan alur. Perubahan dimulai dari komponen shared dan halaman login, lalu menyapu CSSD dan Laundry agar tone konsisten. Semua string yang bernuansa developer, placeholder, atau terlalu deskriptif dipangkas menjadi judul, label, helper text, dan feedback yang lebih langsung.

**Tech Stack:** Next.js 16, React 19, TypeScript, Tailwind CSS 4

---

## Chunk 1: Shared tone baseline

### Task 1: Rapikan login dan shell

**Files:**
- Modify: `src/app/(auth)/login/page.tsx`
- Modify: `src/components/auth/login-form.tsx`
- Modify: `src/app/(auth)/login/actions.ts`
- Modify: `src/components/layout/module-header.tsx`
- Modify: `src/components/layout/cssd-placeholder-page.tsx`
- Modify: `src/app/(protected)/cssd/page.tsx`
- Modify: `src/app/(protected)/laundry/page.tsx`
- Modify: `src/lib/cssd/constants.ts`
- Modify: `src/lib/laundry/constants.ts`

- [ ] Pangkas judul dan deskripsi login menjadi lebih netral dan operasional.
- [ ] Rapikan placeholder input dan pesan error login agar lebih langsung.
- [ ] Pendekkan deskripsi route pada header shell.
- [ ] Pangkas copy landing page modul agar tidak seperti instruksi panjang.

### Task 2: Rapikan komponen shared laporan

**Files:**
- Modify: `src/components/cssd/reports/section-header.tsx`
- Modify: `src/components/laundry/reports/section-header.tsx`
- Modify: `src/components/cssd/reports/filter-field.tsx`
- Modify: `src/components/laundry/reports/filter-field.tsx`
- Modify: `src/components/data/empty-state.tsx`

- [ ] Pastikan label dan helper text shared memakai tone singkat.
- [ ] Hapus kata-kata seperti `ringkasan`, `mulai dari sini`, atau copy pengantar yang terlalu panjang jika tidak penting.

## Chunk 2: CSSD editorial sweep

### Task 3: Rapikan master data dan transaksi CSSD

**Files:**
- Modify: `src/components/cssd/master-data/item-master-data-view.tsx`
- Modify: `src/components/cssd/master-data/uom-master-data-view.tsx`
- Modify: `src/components/cssd/master-data/unit-master-data-view.tsx`
- Modify: `src/components/cssd/transactions/receipt-transaction-view.tsx`
- Modify: `src/components/cssd/transactions/distribution-transaction-view.tsx`
- Modify: `src/components/cssd/transactions/return-transaction-view.tsx`
- Modify: `src/components/cssd/transactions/internal-usage-transaction-view.tsx`
- Modify: `src/components/cssd/transactions/stock-opname-view.tsx`
- Modify: `src/components/cssd/transactions/transaction-history-table.tsx`
- Modify: `src/components/cssd/transactions/stock-summary-table.tsx`

- [ ] Ganti heading seperti `Form ...`, `Detail Stok`, `Ketersediaan`, `Snapshot`, `Draft Aktif` dengan istilah yang lebih ringkas.
- [ ] Pendekkan helper text menjadi satu kalimat atau hapus jika tidak perlu.
- [ ] Samakan tombol dan caption tabel agar tidak berulang secara teknis.

### Task 4: Rapikan laporan CSSD

**Files:**
- Modify: `src/app/(protected)/cssd/laporan/riwayat-transaksi/page.tsx`
- Modify: `src/app/(protected)/cssd/laporan/stok-status/page.tsx`
- Modify: `src/app/(protected)/cssd/laporan/kartu-stok/page.tsx`

- [ ] Pendekkan judul dan deskripsi laporan.
- [ ] Rapikan label filter, ringkasan, dan heading hasil laporan.

## Chunk 3: Laundry editorial sweep

### Task 5: Samakan Laundry dengan tone CSSD

**Files:**
- Modify: `src/components/laundry/master-data/item-master-data-view.tsx`
- Modify: `src/components/laundry/master-data/uom-master-data-view.tsx`
- Modify: `src/components/laundry/master-data/unit-master-data-view.tsx`
- Modify: `src/components/laundry/transactions/receipt-transaction-view.tsx`
- Modify: `src/components/laundry/transactions/distribution-transaction-view.tsx`
- Modify: `src/components/laundry/transactions/return-transaction-view.tsx`
- Modify: `src/components/laundry/transactions/internal-usage-transaction-view.tsx`
- Modify: `src/components/laundry/transactions/stock-opname-view.tsx`
- Modify: `src/components/laundry/transactions/transaction-history-table.tsx`
- Modify: `src/components/laundry/transactions/stock-summary-table.tsx`
- Modify: `src/app/(protected)/laundry/laporan/riwayat-transaksi/page.tsx`
- Modify: `src/app/(protected)/laundry/laporan/stok-status/page.tsx`
- Modify: `src/app/(protected)/laundry/laporan/kartu-stok/page.tsx`

- [ ] Terapkan kosakata operasional yang setara dengan CSSD.
- [ ] Pastikan istilah Laundry tetap sesuai domain seperti `Bersih`, `Kotor`, dan `Area Pencucian`.

## Chunk 4: Verification

### Task 6: Verifikasi pass copy

**Files:**
- Modify: `none unless needed`

- [ ] Jalankan pencarian string untuk kata teknis seperti `shell`, `snapshot`, `kelola`, `workspace`, `placeholder`, `verifikasi`.
- [ ] Jalankan `node node_modules/typescript/bin/tsc --noEmit --pretty false --incremental false`.
- [ ] Catat area yang masih sengaja deskriptif bila memang diperlukan untuk alur user.

