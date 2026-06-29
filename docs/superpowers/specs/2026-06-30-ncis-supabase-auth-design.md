# NCIS Supabase Auth Design

## Summary

Fase ini mengganti halaman login placeholder NCIS menjadi autentikasi Supabase Auth berbasis `email + password` dengan session SSR yang benar-benar aktif di Next.js App Router. Scope hanya mencakup login, logout, sinkronisasi role CSSD, dan akun demo lokal untuk development. Tidak ada manajemen user/role di UI NCIS pada fase ini.

## Goals

- Mengaktifkan login `email + password` untuk user NCIS.
- Menambahkan logout dari area protected.
- Menjadikan `public.profiles` sebagai sumber role utama aplikasi.
- Memastikan JWT/session user membawa role CSSD yang konsisten untuk kebutuhan middleware, server guard, dan RLS.
- Menyediakan bootstrap akun demo lokal untuk development tanpa mengganggu alur produksi.

## Non-Goals

- Tidak membuat halaman manajemen user atau role di UI.
- Tidak menambahkan signup publik.
- Tidak menambahkan magic link, OAuth, atau MFA.
- Tidak mengubah arsitektur CSSD business flow di luar kebutuhan auth.

## Current State

- Session SSR Supabase sudah tersedia melalui helper `createServerSupabaseClient()` dan middleware refresh session.
- Guard CSSD sudah ada dan memakai hasil `supabase.auth.getUser()`.
- Halaman [login](E:/PROJEK%20TTEH/.worktrees/ncis-cssd-mvp/src/app/(auth)/login/page.tsx) masih placeholder.
- Tabel `public.profiles` sudah ada, tetapi row profile seed belum otomatis terhubung dengan user Supabase Auth lokal.
- RLS saat ini mengandalkan claim role pada JWT (`app_metadata` / `user_metadata`) melalui `current_app_role()`.

## Design Decisions

### 1. Source of Truth for Roles

`public.profiles` menjadi sumber role utama. Role di JWT harus dianggap sebagai hasil sinkronisasi dari `profiles`, bukan sumber data utama. Keputusan ini dipilih agar role operasional CSSD, seed data, dan kebijakan RLS memiliki satu sumber kebenaran.

### 2. Login and Logout Flow

- Login dilakukan dari halaman `/login` melalui server action yang menerima `email` dan `password`.
- Server action memanggil `signInWithPassword()` memakai Supabase SSR client.
- Jika autentikasi berhasil, user diarahkan ke `/cssd`.
- Jika gagal, halaman tetap di `/login` dan menampilkan pesan error.
- Logout disediakan dari shell protected dengan server action `signOut()` lalu redirect ke `/login`.

### 3. Profile Resolution

`getCurrentProfile()` akan mengambil user dari `supabase.auth.getUser()`, lalu membaca row `public.profiles` berdasarkan `user_id`. Data profile final yang dipakai aplikasi adalah hasil query profile itu, dengan fallback metadata hanya bila perlu untuk kompatibilitas transisi.

### 4. JWT Role Synchronization

Karena RLS CSSD sudah memakai claim role dari token, dibutuhkan sinkronisasi claim role dari `profiles.app_role` ke access token. Mekanisme yang diutamakan:

- menambahkan hook / fungsi sinkronisasi role di Supabase Auth
- claim role pada JWT dibaca dari `profiles` berdasarkan `user_id`

Dengan ini:

- middleware auth tetap sederhana
- route guard di Next.js tetap konsisten
- RLS database tetap dapat mengevaluasi role tanpa query tambahan pada setiap policy

### 5. Demo Accounts for Local Development

Development lokal memakai dua akun demo:

- `admin.cssd@ncis.local`
- `petugas.cssd@ncis.local`

Password tidak ditulis di repo. Password dibaca dari env server-only:

- `NCIS_DEMO_ADMIN_PASSWORD`
- `NCIS_DEMO_PETUGAS_PASSWORD`

Bootstrap akun demo dilakukan dengan Supabase admin client memakai secret key server-only:

- `SUPABASE_SERVICE_ROLE_KEY` atau secret key ekuivalen

Bootstrap harus idempotent:

- jika user belum ada, buat user Auth
- jika user sudah ada, update email confirmation / metadata yang diperlukan
- sinkronkan row di `profiles`

### 6. Production Path

Untuk produksi:

- admin membuat user manual dari Supabase Dashboard Auth
- admin menambah atau memperbarui row di `public.profiles`
- role claim mengikuti data profile yang telah disinkronkan ke token

Dengan desain ini, jalur produksi tetap sederhana dan tidak bergantung pada akun demo lokal.

## Data and Security Changes

### Environment Variables

Public env tetap:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

Server-only env baru:

- `SUPABASE_SERVICE_ROLE_KEY`
- `NCIS_DEMO_ADMIN_PASSWORD`
- `NCIS_DEMO_PETUGAS_PASSWORD`

Public env tetap boleh dipakai di browser. Server-only env hanya dipakai di server action atau bootstrap script.

### Profiles Policy

Policy `profiles` perlu disesuaikan agar user terautentikasi dapat membaca profile miliknya sendiri, minimal dengan logika setara:

- `auth.uid() = user_id`

Tanpa ini, user yang baru login berisiko tidak bisa memuat profile-nya sendiri kecuali sudah punya claim CSSD lebih dulu, yang membuat bootstrap auth menjadi sirkular.

### Auth Bootstrap Safety

- bootstrap demo account hanya dijalankan lewat script server-side
- tidak ada pemanggilan admin API dari client
- service role key tidak pernah dipakai di browser
- password demo tidak dicetak ke UI

## UX Design

### Login Page

Halaman login tetap sederhana dan operasional:

- branding NCIS
- judul `Login CSSD`
- field email
- field password
- tombol login
- panel bantuan singkat untuk akun demo lokal di environment development bila diperlukan
- pesan error yang ramah dan spesifik

UI tidak perlu membuat wizard atau layout kompleks. Fokusnya kejelasan dan kecepatan akses petugas internal.

### Protected Shell

Area protected menambahkan aksi `logout` di header/shell yang sudah ada. Tidak perlu dropdown manajemen user pada fase ini.

## Testing Strategy

### Auth Logic

- test validasi input login
- test kegagalan autentikasi mengembalikan pesan yang benar
- test sukses login menghasilkan redirect ke `/cssd`
- test logout menghapus session dan redirect ke `/login`

### Profile and Role

- test pembacaan current profile dari `profiles`
- test user bisa membaca profile miliknya sendiri
- test non-CSSD tetap ditolak dari route `/cssd/*`
- test role CSSD tetap lolos guard dan RLS setelah login

### Demo Bootstrap

- test bootstrap user demo bersifat idempotent
- test bootstrap membuat user Auth dan row `profiles` tetap sinkron

## File Impact

Kemungkinan file yang akan dibuat atau diubah:

- `src/app/(auth)/login/page.tsx`
- `src/app/(auth)/login/actions.ts`
- `src/app/(protected)/layout.tsx`
- komponen shell/header terkait logout
- `src/lib/auth/profile.ts`
- `src/lib/env.ts`
- `src/lib/supabase/server.ts`
- helper baru untuk Supabase admin/bootstrap auth
- migration Supabase untuk policy profile dan sinkronisasi claim role
- script bootstrap akun demo lokal
- `.env.example`
- `README.md`
- test auth baru

## Risks and Mitigations

### Risk: Role in JWT and `profiles` drift apart

Mitigasi:

- tetapkan `profiles` sebagai sumber utama
- sinkronisasi role ke token dari `profiles`
- hindari update role manual di dua tempat yang berbeda

### Risk: User login sukses tetapi profile tidak ditemukan

Mitigasi:

- login success flow harus memeriksa profile
- tampilkan pesan yang jelas bila akun Auth belum dipasangkan dengan profile NCIS
- bootstrap demo account memastikan profile selalu ada

### Risk: RLS menghalangi pembacaan profile sendiri

Mitigasi:

- tambah policy `select own profile`
- verifikasi dengan integration test

### Risk: Secret key bocor ke client

Mitigasi:

- admin client hanya di server-only module
- env parsing dipisah antara public dan server-only
- tidak mengimpor helper admin dari komponen client

## Recommended Implementation Order

1. Tambahkan env server-only dan helper admin Supabase.
2. Tambahkan migration untuk sinkronisasi role dan policy `profiles`.
3. Tambahkan bootstrap akun demo lokal.
4. Implementasikan login dan logout flow.
5. Ubah profile resolution agar memakai `profiles`.
6. Tambahkan test auth dan bootstrap.
7. Jalankan verifikasi end-to-end lokal.

## Approval Check

Desain ini dianggap selesai bila:

- login `email + password` berjalan
- logout berjalan
- akun demo lokal bisa dibootstrap dari env
- user produksi tetap bisa dibuat manual lewat dashboard
- role CSSD konsisten di middleware, server guard, dan RLS
