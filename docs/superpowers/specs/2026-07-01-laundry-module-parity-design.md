# Laundry Module Parity Design

## Summary

NCIS akan menambahkan modul `Laundry` sebagai modul kedua setelah `CSSD`. Untuk MVP, Laundry mengikuti struktur, alur transaksi, laporan, dan pola UI yang sama dengan CSSD, dengan perbedaan utama pada:

- namespace route dan backend
- role akses yang terpisah
- istilah status stok dan wording UI tertentu

Tujuan pendekatan ini adalah mempercepat delivery dengan pengalaman pengguna yang konsisten antar modul, sambil tetap menjaga isolasi data dan otorisasi antara CSSD dan Laundry.

## Goals

- Menambahkan modul Laundry yang setara dengan CSSD dari sisi fitur inti.
- Memisahkan data, transaksi, laporan, dan role Laundry dari CSSD.
- Mempertahankan pola navigasi, halaman, dan interaksi yang sudah terbukti berjalan di CSSD.
- Merapikan istilah CSSD dari `Siap Pakai` menjadi `Steril`.

## Non-Goals

- Belum melakukan refactor besar menjadi engine multi-modul generik.
- Belum menambahkan fitur domain Laundry yang unik di luar parity dengan CSSD.
- Belum mengubah modul Ambulance.
- Belum membangun shared abstraction penuh untuk seluruh transaksi lintas modul.

## Product Scope

Laundry MVP mencakup halaman dan flow yang sama dengan CSSD:

### Master Data

- Item
- Satuan
- Unit

### Transaksi

- Pemasukan
- Distribusi
- Pengembalian
- Pemakaian Internal
- Stok Opname

### Laporan

- Riwayat Transaksi
- Stok Status
- Kartu Stok

Semua pola filter, submenu show/hide, dan export CSV mengikuti perilaku CSSD saat ini.

## Terminology

### CSSD terminology update

- `Siap Pakai` berubah menjadi `Steril`

### Laundry terminology

Laundry mengikuti status posisi stok yang sama secara konsep, tetapi labelnya berbeda:

- `READY` → `Bersih`
- `IN_UNIT` → `Di Unit`
- `NON_STERILE` → `Kotor`
- `STERILIZATION_AREA` → `Area Pencucian`
- `DAMAGED` → `Rusak`

Secara domain, ini berarti kita tetap mempertahankan model status yang sama seperti CSSD untuk mempercepat pengembangan, tetapi UI dan laporan Laundry akan menampilkan istilah operasional Laundry.

## Access Control

Role Laundry dipisahkan dari CSSD sejak awal:

- `ADMIN_LAUNDRY`
- `PETUGAS_LAUNDRY`

Implikasi desain:

- user CSSD tidak otomatis bisa masuk ke route Laundry
- user Laundry tidak otomatis bisa masuk ke route CSSD
- login flow, profile role resolution, dan middleware harus mengenali kedua keluarga role
- label role di layout modul harus tampil sesuai modul aktif

## Architecture

## Module Routing

Laundry memiliki namespace route sendiri:

- `/laundry`
- `/laundry/master-data/...`
- `/laundry/pemasukan`
- `/laundry/distribusi`
- `/laundry/pengembalian`
- `/laundry/pemakaian-internal`
- `/laundry/stok-opname`
- `/laundry/laporan/...`

Selector modul di header akan mengaktifkan CSSD dan Laundry sebagai modul nyata, sedangkan Ambulance tetap placeholder.

## Backend Isolation

Walaupun perilakunya meniru CSSD, data Laundry harus dipisah penuh dari CSSD. Karena itu, Laundry akan memiliki tabel, fungsi, dan report view sendiri di database.

Contoh naming pattern:

- `laundry_receive_stock(...)`
- `laundry_distribute_stock(...)`
- `laundry_return_stock(...)`
- `laundry_record_internal_usage(...)`
- `laundry_current_stock_report_v`
- `laundry_transaction_history_report_v`
- `laundry_item_stock_card_report_v`

Pendekatan ini dipilih agar:

- stok Laundry tidak pernah bercampur dengan CSSD
- aturan RLS bisa dipisah per modul
- laporan dan debugging lebih jelas

## Frontend Strategy

Frontend Laundry mengikuti pola CSSD, tetapi tidak sekadar copy mentah. Pendekatan yang dipilih adalah `hybrid parity`:

- build modul Laundry secara terpisah seperti clone fungsional CSSD
- sambil mengekstrak bagian kecil yang memang mudah dan aman untuk dibagi

Bagian yang cocok dibagi secara bertahap:

- helper auth umum
- helper CSV umum
- pola grouped sidebar
- formatter kecil yang tidak domain-specific

Bagian yang tetap dipisah untuk MVP:

- constants modul
- service transaksi
- service laporan
- page routes
- migration dan SQL functions

Pendekatan ini menyeimbangkan kecepatan pengembangan dan maintainability, tanpa memaksa refactor besar pada CSSD yang sudah stabil.

## Data Model Strategy

Laundry mengikuti struktur entitas CSSD, tetapi berada pada namespace logis yang berbeda.

Secara bentuk, modul Laundry memerlukan:

- master reference:
  - satuan
  - unit rumah sakit
  - item
- stok aktif:
  - stock balances
  - stock movements
- transaksi:
  - pemasukan
  - distribusi
  - pengembalian
  - pemakaian internal
  - stok opname
- laporan:
  - stok status
  - riwayat transaksi
  - kartu stok

Jenis item Laundry juga disamakan dengan CSSD:

- `REUSABLE`
- `CONSUMABLE_DISTRIBUTION`
- `CONSUMABLE_INTERNAL`

Ini menjaga kesamaan perilaku form, transaksi, dan laporan, sekaligus menyederhanakan parity implementation.

## UX And Navigation

Dari sisi user, target pengalaman Laundry adalah:

- terasa sangat familiar bagi user yang sudah memakai CSSD
- navigasi, urutan halaman, dan struktur submenu tetap konsisten
- istilah Laundry tampil natural di seluruh tabel, form, report, dan badge status

Struktur menu Laundry mengikuti pola CSSD:

- `Master Data` sebagai grouped menu
- transaksi sebagai link terpisah
- `Laporan` sebagai grouped menu dengan:
  - `Riwayat Transaksi`
  - `Stok Status`
  - `Kartu Stok`

## Implementation Strategy

Urutan implementasi yang direkomendasikan:

1. Perluas auth dan role model untuk mendukung Laundry.
2. Aktifkan shell modul Laundry:
   - module selector
   - layout
   - sidebar
   - route metadata
3. Tambahkan migration, fungsi SQL, dan report view Laundry.
4. Tambahkan service backend dan integration tests Laundry.
5. Bangun halaman Laundry dengan parity terhadap CSSD.
6. Rapikan label CSSD `Steril`.
7. Jalankan verifikasi full untuk CSSD dan Laundry.

Urutan ini meminimalkan risiko:

- auth dan akses beres dulu sebelum halaman dibuka
- backend parity selesai sebelum UI lengkap dipasang
- perubahan wording CSSD dilakukan terkontrol, bukan bercampur dengan debug domain Laundry

## Testing Strategy

### Unit Tests

- constants dan label Laundry
- role parsing dan guard Laundry
- header/sidebar Laundry
- report formatter Laundry
- helper CSV yang dipakai lintas modul

### Integration Tests

- master data Laundry
- pemasukan Laundry
- distribusi Laundry
- pengembalian Laundry
- pemakaian internal Laundry
- stok opname Laundry
- laporan Laundry

### Regression Coverage

- CSSD tetap lolos setelah label `Steril`
- auth tidak mencampur role CSSD dan Laundry
- export CSV CSSD tetap berjalan
- grouped navigation CSSD tetap berjalan

### Verification

- focused `vitest` untuk unit dan integration tests Laundry
- `pnpm exec tsc --noEmit`
- `pnpm build`
- manual browser verification untuk:
  - login user Laundry
  - route access isolation
  - transaksi inti
  - laporan Laundry

## Risks And Mitigations

### Risk: CSSD-centric code makes parity noisy

Mitigasi:

- jangan refactor generik besar sekaligus
- ekstrak hanya helper yang benar-benar mudah dibagi
- biarkan MVP Laundry memakai struktur paralel

### Risk: Role and RLS changes break CSSD access

Mitigasi:

- tambah test auth sebelum memperluas middleware
- pisahkan guard CSSD dan Laundry dengan helper yang eksplisit

### Risk: Duplicate code grows too quickly

Mitigasi:

- dokumentasikan batas duplikasi yang diterima untuk MVP
- setelah Laundry parity stabil, baru evaluasi shared abstraction tahap berikutnya

## Recommendation

Bangun Laundry sebagai modul parity terhadap CSSD dengan backend, route, dan role yang terpisah penuh, sambil hanya mengekstrak util kecil yang aman dibagi. Ini adalah pendekatan tercepat yang tetap aman untuk data, akses, dan stabilitas modul CSSD yang sudah berjalan.
