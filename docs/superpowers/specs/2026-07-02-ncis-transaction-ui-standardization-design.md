# NCIS transaction UI standardization design

## Summary

NCIS akan merapikan seluruh halaman transaksi di modul CSSD dan Laundry dengan satu pola UI yang konsisten: `ringkasan atas + form bertahap + feedback hasil + tabel bantu`.

Tujuan utamanya bukan mengubah alur bisnis transaksi, tetapi menyederhanakan pengalaman operator agar setiap halaman terasa seragam, lebih operasional, dan tidak menampilkan bahasa teknis yang tidak perlu.

Desain ini mengikuti struktur Next.js App Router yang sudah dipakai sekarang:

- mutasi tetap lewat `server action`
- state submit tetap lewat `useActionState`
- page server component tetap fokus pada data awal
- komponen client tetap menangani interaktivitas form, pending state, dan feedback

## Goals

- Menyamakan ritme visual halaman transaksi CSSD dan Laundry.
- Menggeser fokus halaman dari pola `riwayat besar + form samping` menjadi `ringkasan konteks + form utama`.
- Menyederhanakan copy agar lebih cocok untuk staf operasional.
- Mempertahankan alur submit, validasi, dan refresh data yang sudah berjalan.
- Membuat setiap halaman transaksi lebih mudah dipelajari karena struktur dan urutannya konsisten.

## Non-goals

- Tidak mengubah aturan bisnis transaksi.
- Tidak mengubah struktur database, query stok, atau report logic.
- Tidak mengganti pola `server action` yang sudah dipakai.
- Tidak membangun design system besar baru di luar kebutuhan transaksi.
- Tidak menyatukan CSSD dan Laundry menjadi satu engine generik penuh pada tahap ini.

## Current state

Saat ini, halaman transaksi seperti `Pemasukan` dan `Distribusi` masih dominan memakai pola:

- sisi kiri untuk judul dan riwayat transaksi
- sisi kanan untuk form input dan panel stok

Kelebihan pola ini adalah informasi lengkap langsung terlihat. Kekurangannya:

- fokus operator terpecah antara riwayat dan form
- urutan kerja tidak terasa linear
- panel konteks stok terasa seperti panel teknis, bukan bantuan kerja
- copy dan hierarchy antar halaman masih belum sepenuhnya seirama

## Chosen direction

Pola yang dipilih adalah `opsi C`: `ringkasan atas + form bertahap`.

Alasan pemilihan:

- tetap memberi konteks stok dan alur sebelum user input
- form tetap menjadi elemen dominan di layar
- paling mudah diterapkan konsisten di CSSD dan Laundry
- paling aman untuk responsive layout karena mudah ditumpuk menjadi satu kolom di mobile

## UX structure

Setiap halaman transaksi akan memakai urutan blok yang sama:

1. `Header halaman`
2. `Kartu ringkasan atas`
3. `Form transaksi`
4. `Feedback hasil transaksi`
5. `Tabel bantu`

### 1. Header halaman

Header tetap singkat:

- judul pekerjaan, misalnya `Pemasukan`, `Distribusi`, `Pengembalian`
- satu deskripsi pendek yang langsung ke tujuan kerja user

Header tidak perlu lagi memakai copy yang terlalu menjelaskan sistem.

### 2. Kartu ringkasan atas

Kartu ringkasan tampil sebelum form untuk memberi konteks cepat.

Jumlah ideal: 2 sampai 3 kartu.

Isi kartu menyesuaikan halaman, tetapi polanya tetap:

- `stok saat ini`
- `posisi atau tujuan alur`
- `catatan konteks`, misalnya unit terkait, item yang dipilih, atau kondisi reusable

Kartu ini bukan dashboard mini. Fungsinya hanya memberi orientasi sebelum input.

### 3. Form transaksi

Form menjadi blok visual utama.

Urutan bidang harus konsisten:

- identitas transaksi: tanggal dan referensi bila perlu
- item dan jenis item
- quantity
- unit atau area terkait
- catatan

Form dibagi ke kelompok kecil agar terasa bertahap, bukan satu daftar panjang.

Untuk copy:

- label harus ringkas
- helper text hanya muncul bila benar-benar membantu keputusan user
- tombol submit memakai kata kerja aktif, misalnya `Simpan pemasukan`

### 4. Feedback hasil transaksi

Setelah submit:

- sukses tampil singkat dan langsung
- error tampil jelas tanpa nada dramatis
- dampak stok tampil sebagai hasil kerja, bukan kalimat sistem

Contoh arah copy:

- `Pemasukan berhasil disimpan.`
- `Distribusi belum bisa disimpan. Coba lagi.`
- `Jumlah 5 dari Steril ke ICU. Stok CSSD sekarang 12.`

### 5. Tabel bantu

Tabel bantu tetap ada, tetapi posisinya turun ke bawah agar tidak merebut fokus form.

Jenis tabel menyesuaikan halaman:

- `riwayat transaksi terbaru`
- `stok saat ini`
- tabel bantu khusus reusable atau stok opname bila diperlukan

Tabel tetap penting sebagai validasi cepat, tetapi menjadi konteks sekunder, bukan fokus pertama.

## Module behavior

### CSSD

Istilah transaksi mengikuti kamus operasional CSSD:

- `Steril`
- `Tidak Steril`
- `Area Sterilisasi`
- `Rusak`

### Laundry

Istilah transaksi mengikuti kamus operasional Laundry:

- `Bersih`
- `Kotor`
- `Area Pencucian`
- `Rusak`

Layout, hierarchy, spacing, dan feedback pattern harus sama dengan CSSD. Yang berubah hanya istilah operasional dan konteks stoknya.

## Component strategy

Pendekatan implementasi yang direkomendasikan adalah shared UI shell ringan, bukan refactor domain besar.

Bagian yang layak dibuat shared:

- section wrapper transaksi
- kartu ringkasan kecil
- blok feedback
- action area form
- heading dan subheading pattern

Bagian yang tetap domain-specific:

- field yang spesifik per transaksi
- opsi item type
- unit/area logic
- read model yang mengisi tabel dan ringkasan

Dengan pendekatan ini:

- CSSD dan Laundry tetap terpisah secara domain
- visual pattern tetap seragam
- perubahan tidak perlu memaksa abstraction berat di layer bisnis

## Next.js alignment

Berdasarkan panduan Next.js App Router yang dirujuk lewat Context7 untuk `Next.js 16.2.9`, pola yang dipertahankan adalah:

- form submit tetap memakai `server action`
- client component memakai `useActionState` untuk pending state dan feedback
- page server component tetap bertugas menyediakan data awal
- mutasi tetap memicu refresh data agar tampilan sinkron setelah submit

Implikasinya untuk desain ini:

- perubahan utama berada pada layout, copy, dan grouping UI
- tidak perlu memindahkan logic submit ke client-side fetch manual
- feedback banner dan pending state tetap berada dekat tombol dan form

## Responsive behavior

### Desktop

- kartu ringkasan tampil dalam 2 atau 3 kolom
- form tampil penuh sebagai blok utama
- tabel bantu tampil di bawah form, bukan sejajar besar dengan form

### Mobile

- semua blok menjadi satu kolom
- urutan wajib dipertahankan:
  - header
  - ringkasan
  - form
  - feedback
  - tabel

Tujuannya agar pengalaman kerja tetap linear saat dipakai lewat layar kecil.

## Accessibility and interaction

- tombol submit harus menampilkan pending state yang jelas
- area feedback harus tetap mudah dibaca setelah submit
- focus state field dan tombol harus konsisten
- angka stok dan qty tetap memakai tabular number jika ditampilkan sebagai nilai utama
- jangan gunakan warna saja sebagai satu-satunya penanda status

## Testing strategy

### UI regression

- setiap halaman transaksi CSSD tetap render dengan struktur baru
- setiap halaman transaksi Laundry mengikuti struktur yang sama
- copy utama mengikuti panduan `NCIS copy guidelines`

### State behavior

- pending state tombol tetap muncul saat submit
- sukses dan error tetap muncul lewat `useActionState`
- feedback impact tetap tampil setelah transaksi berhasil

### Responsive verification

- cek layout desktop dan mobile untuk:
  - pemasukan
  - distribusi
  - pengembalian
  - pemakaian internal
  - stok opname

### Technical verification

- `tsc --noEmit`
- test unit yang menyentuh halaman transaksi
- browser check untuk memastikan hierarchy baru tetap nyaman dipakai

## Risks and mitigations

### Risk: visual refactor menyentuh terlalu banyak halaman

Mitigasi:

- mulai dari shared transaction shell kecil
- sapu halaman per kelompok, bukan sekaligus tanpa checkpoint

### Risk: copy sudah rapi di satu halaman tetapi drift di halaman lain

Mitigasi:

- jadikan `NCIS copy guidelines` sebagai acuan tetap
- gunakan label panel dan tombol yang sama lintas modul

### Risk: panel ringkasan berubah menjadi terlalu ramai

Mitigasi:

- batasi ringkasan menjadi maksimal tiga kartu
- kartu hanya berisi konteks yang membantu keputusan input

## Recommendation

Standarkan seluruh halaman transaksi NCIS memakai pola `ringkasan atas + form bertahap + feedback hasil + tabel bantu`, sambil mempertahankan `server action` dan `useActionState` yang sudah berjalan. Pendekatan ini memberi peningkatan UX yang terasa besar, tetapi tetap aman karena tidak mengubah logika domain inti.
