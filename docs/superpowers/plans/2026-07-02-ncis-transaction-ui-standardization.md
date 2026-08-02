# NCIS transaction UI standardization Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Menstandarkan seluruh halaman transaksi CSSD dan Laundry ke pola `ringkasan atas + form bertahap + feedback hasil + tabel bantu` tanpa mengubah logika transaksi yang sudah berjalan.

**Architecture:** Implementasi dimulai dari test dan komponen shared kecil di `src/components/transactions`, lalu menyapu CSSD dan Laundry per kelompok halaman. `server action`, `useActionState`, dan server component data-loading tetap dipertahankan; yang berubah hanya hierarchy visual, copy operasional, dan pengelompokan blok UI.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Tailwind CSS 4, Vitest, Testing Library, Context7 reference for Next.js 16 forms/server actions

---

## File map

- `src/components/transactions/transaction-page-shell.tsx`
  Shared wrapper untuk header, ringkasan, form, feedback, dan tabel bantu.
- `src/components/transactions/transaction-summary-strip.tsx`
  Shared grid kecil untuk 2-3 kartu ringkasan operasional.
- `src/components/transactions/transaction-feedback.tsx`
  Shared feedback yang tetap dipakai, tetapi mungkin butuh penyesuaian copy kecil agar nyambung dengan shell baru.
- `src/components/cssd/transactions/*.tsx`
  Implementasi halaman transaksi CSSD yang akan dipindah ke shell baru.
- `src/components/laundry/transactions/*.tsx`
  Implementasi halaman transaksi Laundry yang akan dipindah ke shell baru dengan istilah operasional Laundry.
- `tests/unit/components/cssd/transaction-pages.test.tsx`
  Regression test untuk pemasukan, distribusi, dan pengembalian CSSD.
- `tests/unit/components/cssd/remaining-transaction-pages.test.tsx`
  Regression test untuk pemakaian internal dan stok opname CSSD.
- `tests/unit/components/laundry/transaction-pages.test.tsx`
  Test baru untuk pemasukan, distribusi, dan pengembalian Laundry.
- `tests/unit/components/laundry/remaining-transaction-pages.test.tsx`
  Test baru untuk pemakaian internal dan stok opname Laundry.

## Chunk 1: Shared transaction foundation

### Task 1: Kunci target hierarchy CSSD lewat test

**Files:**
- Modify: `tests/unit/components/cssd/transaction-pages.test.tsx`
- Modify: `tests/unit/components/cssd/remaining-transaction-pages.test.tsx`

- [ ] Ubah assertion CSSD agar menargetkan hierarchy baru: heading singkat, kartu ringkasan, form utama, dan tabel bantu di bawah.
- [ ] Tambahkan assertion copy yang mengikuti `NCIS copy guidelines`, misalnya hilangnya heading seperti `kelola ... cssd` dan bergantinya label panel teknis.
- [ ] Jalankan:
  `node node_modules/vitest/vitest.mjs run tests/unit/components/cssd/transaction-pages.test.tsx tests/unit/components/cssd/remaining-transaction-pages.test.tsx`
  Expected: FAIL karena hierarchy baru belum di-render.
- [ ] Catat assertion yang benar-benar mewakili pola final, bukan sekadar mencocokkan string sementara.

### Task 2: Buat shell transaksi shared yang cukup kecil

**Files:**
- Create: `src/components/transactions/transaction-page-shell.tsx`
- Create: `src/components/transactions/transaction-summary-strip.tsx`
- Modify: `src/components/transactions/transaction-feedback.tsx`

- [ ] Buat `transaction-page-shell.tsx` yang menerima slot untuk `summary`, `form`, dan `supportingContent`.
- [ ] Buat `transaction-summary-strip.tsx` yang merender maksimal tiga kartu ringkasan dengan angka/copy operasional.
- [ ] Pertahankan `TransactionFeedback` dekat tombol/form, tetapi sesuaikan spacing bila shell baru membutuhkannya.
- [ ] Jalankan ulang test CSSD yang tadi dibuat fail.
  Expected: masih FAIL atau partial FAIL sampai view CSSD dipindah ke shell baru.
- [ ] Commit fondasi shared setelah file shared stabil.
  Suggested commit: `feat: add shared transaction layout shell`

## Chunk 2: CSSD rollout

### Task 3: Migrasikan pemasukan, distribusi, dan pengembalian CSSD

**Files:**
- Modify: `src/components/cssd/transactions/receipt-transaction-view.tsx`
- Modify: `src/components/cssd/transactions/distribution-transaction-view.tsx`
- Modify: `src/components/cssd/transactions/return-transaction-view.tsx`
- Modify: `src/components/cssd/transactions/transaction-history-table.tsx`
- Modify: `src/components/cssd/transactions/stock-summary-table.tsx`

- [ ] Pindahkan tiga halaman ini ke pola `ringkasan atas + form bertahap + tabel bantu`.
- [ ] Ubah copy judul, deskripsi, label panel, dan caption tabel agar singkat dan operasional.
- [ ] Hitung ringkasan dari props yang sudah ada, tanpa menambah query/read model baru bila tidak diperlukan.
- [ ] Pastikan feedback sukses/error tetap muncul di area form melalui `useActionState`.
- [ ] Jalankan:
  `node node_modules/vitest/vitest.mjs run tests/unit/components/cssd/transaction-pages.test.tsx`
  Expected: PASS.
- [ ] Commit hasil rollout tahap pertama.
  Suggested commit: `feat: standardize cssd primary transaction pages`

### Task 4: Migrasikan pemakaian internal dan stok opname CSSD

**Files:**
- Modify: `src/components/cssd/transactions/internal-usage-transaction-view.tsx`
- Modify: `src/components/cssd/transactions/stock-opname-view.tsx`
- Modify: `tests/unit/components/cssd/remaining-transaction-pages.test.tsx`

- [ ] Terapkan shell baru ke `InternalUsageTransactionView` dengan fokus pada item internal, qty, dan stok saat ini.
- [ ] Terapkan shell baru ke `StockOpnameView` tanpa merusak alur draft session, line entry, dan finalisasi.
- [ ] Jaga agar area stok opname tetap linear: ringkasan aktif -> form draft/line -> feedback -> sesi atau stok bantu.
- [ ] Jalankan:
  `node node_modules/vitest/vitest.mjs run tests/unit/components/cssd/remaining-transaction-pages.test.tsx`
  Expected: PASS.
- [ ] Jalankan gabungan CSSD:
  `node node_modules/vitest/vitest.mjs run tests/unit/components/cssd/transaction-pages.test.tsx tests/unit/components/cssd/remaining-transaction-pages.test.tsx`
  Expected: PASS.
- [ ] Commit hasil rollout CSSD lengkap.
  Suggested commit: `feat: standardize remaining cssd transaction pages`

## Chunk 3: Laundry parity

### Task 5: Tambahkan regression test transaksi Laundry

**Files:**
- Create: `tests/unit/components/laundry/transaction-pages.test.tsx`
- Create: `tests/unit/components/laundry/remaining-transaction-pages.test.tsx`

- [ ] Mirror struktur test CSSD ke Laundry dengan istilah Laundry: `Bersih`, `Kotor`, `Area Pencucian`, dan copy tombol yang setara.
- [ ] Pastikan test mencakup hierarchy baru, bukan hanya keberadaan field lama.
- [ ] Jalankan:
  `node node_modules/vitest/vitest.mjs run tests/unit/components/laundry/transaction-pages.test.tsx tests/unit/components/laundry/remaining-transaction-pages.test.tsx`
  Expected: FAIL karena halaman Laundry belum memakai shell baru.
- [ ] Rapikan fixture agar reusable dan consumable tetap mewakili kasus Laundry yang sama dengan CSSD.

### Task 6: Migrasikan seluruh halaman transaksi Laundry ke pola yang sama

**Files:**
- Modify: `src/components/laundry/transactions/receipt-transaction-view.tsx`
- Modify: `src/components/laundry/transactions/distribution-transaction-view.tsx`
- Modify: `src/components/laundry/transactions/return-transaction-view.tsx`
- Modify: `src/components/laundry/transactions/internal-usage-transaction-view.tsx`
- Modify: `src/components/laundry/transactions/stock-opname-view.tsx`
- Modify: `src/components/laundry/transactions/transaction-history-table.tsx`
- Modify: `src/components/laundry/transactions/stock-summary-table.tsx`
- Modify: `tests/unit/components/laundry/transaction-pages.test.tsx`
- Modify: `tests/unit/components/laundry/remaining-transaction-pages.test.tsx`

- [ ] Terapkan layout shared yang sama dengan CSSD ke seluruh halaman transaksi Laundry.
- [ ] Ganti copy konteks dan ringkasan agar tetap memakai istilah Laundry, bukan menyalin CSSD mentah.
- [ ] Pastikan caption tabel, summary card, dan feedback tetap seirama dengan CSSD tetapi domain-correct untuk Laundry.
- [ ] Jalankan:
  `node node_modules/vitest/vitest.mjs run tests/unit/components/laundry/transaction-pages.test.tsx tests/unit/components/laundry/remaining-transaction-pages.test.tsx`
  Expected: PASS.
- [ ] Jalankan satu regression cross-module:
  `node node_modules/vitest/vitest.mjs run tests/unit/components/cssd/transaction-pages.test.tsx tests/unit/components/cssd/remaining-transaction-pages.test.tsx tests/unit/components/laundry/transaction-pages.test.tsx tests/unit/components/laundry/remaining-transaction-pages.test.tsx`
  Expected: PASS.
- [ ] Commit parity rollout Laundry.
  Suggested commit: `feat: standardize laundry transaction pages`

## Chunk 4: Verification and polish

### Task 7: Verifikasi teknis dan browser pass

**Files:**
- Modify: `none unless verification reveals a small fix`

- [ ] Jalankan typecheck fokus repo:
  `node node_modules/typescript/bin/tsc --noEmit --pretty false --incremental false`
  Expected: PASS.
- [ ] Jalankan targeted test suite transaksi:
  `node node_modules/vitest/vitest.mjs run tests/unit/components/cssd/transaction-pages.test.tsx tests/unit/components/cssd/remaining-transaction-pages.test.tsx tests/unit/components/laundry/transaction-pages.test.tsx tests/unit/components/laundry/remaining-transaction-pages.test.tsx`
  Expected: PASS.
- [ ] Verifikasi manual di browser untuk halaman:
  `CSSD > Pemasukan`, `Distribusi`, `Pengembalian`, `Pemakaian Internal`, `Stok Opname`
  serta padanannya di Laundry.
- [ ] Cek mobile dan desktop: urutan blok harus tetap `header -> ringkasan -> form -> feedback -> tabel`.
- [ ] Jika perlu fix kecil dari hasil QA, lakukan fix minimal dan rerun typecheck + targeted Vitest.
- [ ] Commit final verification pass.
  Suggested commit: `refactor: complete transaction ui standardization`

