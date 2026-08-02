# Redesain Modul Ambulance (Emergency Dispatch Console) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesain modul Ambulance (Order Wizard, History View, dan Master Data View) menjadi tampilan *Modern Emergency Dispatch Console* yang keren, presisi, beraksesibilitas tinggi, dan profesional menggunakan Tailwind v4, Lucide/Phosphor Icons, dan shadcn/ui.

**Architecture:** Memperbarui 3 komponen React UI utama (`order-wizard.tsx`, `ambulance-history-view.tsx`, `ambulance-master-view.tsx`) dengan menambahkan statistik ringkasan, badge spesifikasi armada, floating summary card pada peta, dan dialog form modern.

**Tech Stack:** Next.js (React Client Components), Tailwind v4, Lucide Icons, shadcn/ui (Card, Badge, Button, Table, Dialog, Form), Leaflet (Map Picker & Route Map).

## Global Constraints

- **Design System:** Modern Emergency Dispatch Console (Slate/Zinc netral + Emerald/Teal status + Sky/Cyan aksi utama).
- **Responsive Layout:** Grid responsif 1-3 kolom dengan batas maksimum kontainer `max-w-7xl mx-auto`.
- **Contrast & Accessibility:** Memenuhi standar kontras WCAG AA (teks badge & tombol kontras tinggi).

---

### Task 1: Redesain Halaman Pemesanan Armada (Order Wizard)

**Files:**
- Modify: `src/components/ambulance/order/order-wizard.tsx`

**Interfaces:**
- Consumes: `ambulances` (database rows), `hospitalCoords` `[lat, lng]`, `createAmbulanceOrder` action.
- Produces: Visual wizard 2-step yang modern (Pilih Armada & Tentukan Tujuan + Floating Estimation Summary Card).

- [ ] **Step 1: Update Step Indicator & Header UI**

Tambahkan progress step visual di bagian atas komponen yang memperlihatkan alur (*Step 1: Pilih Armada* -> *Step 2: Tentukan Lokasi*).

- [ ] **Step 2: Redesain Grid Card Armada (Step 1)**

Pusatkan card armada dengan bingkai presisi (`border border-slate-200 bg-white hover:shadow-md hover:border-sky-500/40`), badge plat nomor, spesifikasi fasilitas (misal *ICU Unit*, *Emergency Response*), ketersediaan stok/status, dan tombol CTA "Pilih Armada Ini".

- [ ] **Step 3: Redesain Peta & Floating Checkout Card (Step 2)**

Bungkus `MapComponent` dengan kontainer peta berbingkai tinggi (min `h-[480px]`), dan tampilkan *Floating Summary Card* di bawah/sisi peta yang menyajikan rincian Jarak (km), Tarif/km, dan Total Biaya dengan font ekspresif & tombol konfirmasi pesanan.

- [ ] **Step 4: Verifikasi & Testing Manual**

Buka halaman `/ambulance/order`, pastikan transisi antar step berjalan mulus dan perhitungannya presisi.

---

### Task 2: Redesain Halaman Riwayat Transaksi (History View)

**Files:**
- Modify: `src/components/ambulance/history/ambulance-history-view.tsx`

**Interfaces:**
- Consumes: `transactions` (array of `AmbulanceTransactionHistory`).
- Produces: Dashboard riwayat pemesanan dengan Quick Stat Cards & Tabel Data Modern.

- [ ] **Step 1: Tambahkan 3 Quick Stat Metric Cards**

Di atas tabel riwayat, tampilkan 3 statistik ringkas:
1. *Total Disposisi Ambulans* (Jumlah pesanan)
2. *Total Jarak Tempuh* (Km)
3. *Total Estimasi Biaya* (Rp)

- [ ] **Step 2: Tambahkan Filter / Search Bar Cepat**

Sediakan baris filter pencarian nama armada atau nomor plat di atas tabel.

- [ ] **Step 3: Poles Tabel Riwayat**

Ubah baris tabel agar menyajikan ikon armada, tanggal terformat lokal Indonesia, koordinat lokasi yang terkemas dalam bentuk badge lokasi (`Lat/Lng`), serta format mata uang rupiah yang jelas.

- [ ] **Step 4: Verifikasi Tampilan**

Buka `/ambulance/history` dan pastikan tampilan tabel dan stat cards terisi dengan rapi.

---

### Task 3: Redesain Halaman Master Data & Pengaturan Lokasi (Master View)

**Files:**
- Modify: `src/components/ambulance/master/ambulance-master-view.tsx`

**Interfaces:**
- Consumes: `initialAmbulances`, `initialSettings`, `saveAmbulanceSettings`, `saveAmbulance`.
- Produces: Halaman manajemen master data armada dan titik koordinat pusat rumah sakit yang modern.

- [ ] **Step 1: Tambahkan Card Quick Fleet Metrics**

Tampilkan indikator jumlah total armada (Aktif vs Non-aktif).

- [ ] **Step 2: Poles Layout Pengaturan Rumah Sakit (Peta & Koordinat)**

Integrasikan Form Latitude & Longitude dengan `MapPicker` agar menjadi kartu pengaturan lokasi rumah sakit yang indah, presisi, dan mudah dipakai.

- [ ] **Step 3: Poles Tabel & Dialog Modal Form Armada**

Tingkatkan tampilan tabel master armada dan buat dialog modal (*Tambah / Edit Armada*) lebih rapi dengan tombol aksi yang jelas & penanganan status loading (`isPending`).

- [ ] **Step 4: Verifikasi Akhir & Build Check**

Jalankan pengujian lint/build untuk memastikan seluruh komponen terkompilasi tanpa error.
