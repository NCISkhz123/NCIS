# NCIS CSSD MVP

NCIS adalah singkatan dari **Non Clinical Integrated System**. Repository ini berisi MVP modul **CSSD** sebagai fase pertama, dengan cakupan:

- master data `Item`, `Satuan`, dan `Unit`
- pemasukan barang
- distribusi ke unit
- pengembalian reusable
- perpindahan reusable antar area CSSD
- pemakaian internal konsumabel
- stok opname
- laporan stok saat ini, riwayat transaksi, dan kartu stok

Tech stack utama:

- Next.js App Router
- TypeScript
- Tailwind CSS
- Supabase Auth + Postgres
- Vitest + Testing Library

## Prasyarat

- Node.js 20+
- `pnpm`
- Docker Desktop aktif
- Supabase CLI (`pnpm` script di repo ini sudah memakai package `supabase`)

## Setup Lokal

1. Install dependency:

```bash
pnpm install
```

2. Buat file environment lokal:

```bash
copy .env.example .env.local
```

3. Untuk setup lokal lengkap sampai app langsung jalan, cukup pakai:

```bash
pnpm local:dev
```

Command itu akan menjalankan:

- `pnpm supabase:start`
- `pnpm supabase:reset`
- `pnpm auth:bootstrap-demo`
- `pnpm dev`

4. Jika ingin menjalankan langkahnya manual, ambil nilai berikut dari output `pnpm supabase:status`, lalu isi di `.env.local`:

- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

5. Isi sendiri password demo lokal di `.env.local`:

- `NCIS_DEMO_ADMIN_PASSWORD`
- `NCIS_DEMO_PETUGAS_PASSWORD`

6. Pastikan `NEXT_PUBLIC_SUPABASE_URL` cocok dengan API URL lokal Supabase. Default repo ini memakai:

```env
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:55321
```

7. Jika tidak memakai `pnpm local:dev`, reset database lokal agar migration dan seed terbaru terpasang:

```bash
pnpm supabase:reset
```

8. Jika tidak memakai `pnpm local:dev`, jalankan aplikasi:

```bash
pnpm dev
```

9. Jika tidak memakai `pnpm local:dev`, bootstrap akun demo lokal:

```bash
pnpm auth:bootstrap-demo
```

App akan tersedia di [http://localhost:3000](http://localhost:3000).

## Environment Variables

Variabel yang wajib untuk aplikasi saat ini:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NCIS_DEMO_ADMIN_PASSWORD=
NCIS_DEMO_PETUGAS_PASSWORD=
```

Catatan:

- Untuk local development, `NEXT_PUBLIC_SUPABASE_URL` biasanya `http://127.0.0.1:55321`.
- Untuk Vercel + Supabase Cloud, isi dengan URL project Supabase dan anon key dari dashboard Supabase.
- `SUPABASE_SERVICE_ROLE_KEY` hanya boleh dipakai server-side untuk bootstrap demo auth, jangan pernah diekspos ke client.

## Workflow Supabase

Perintah yang paling sering dipakai:

```bash
pnpm local:dev
pnpm local:fix
pnpm local:start
pnpm local:app
pnpm local:quick
pnpm local:clean
pnpm supabase:start
pnpm supabase:status
pnpm supabase:reset
pnpm supabase:stop
pnpm auth:bootstrap-demo
```

Keterangan:

- `pnpm local:dev`: setup lokal lengkap lalu langsung menjalankan Next.js dev server
- `pnpm local:fix`: bersihkan stack Supabase lokal milik repo ini lalu jalankan ulang setup lengkap + dev server
- `pnpm local:start`: jalur ringan harian untuk memastikan Supabase lokal aktif dan akun demo siap tanpa reset/stop stack lebih dulu
- `pnpm local:app`: hanya menjalankan Next.js dev server
- `pnpm local:quick`: jalur cepat harian, yaitu `local:start` lalu `local:app`
- `pnpm local:clean`: hentikan stack Supabase lokal milik repo ini dan hapus data volume lokalnya
- `pnpm supabase:start`: menyalakan stack Supabase lokal minimum yang dibutuhkan NCIS saat ini
- `pnpm supabase:status`: melihat URL, key, dan service status lokal
- `pnpm supabase:reset`: reset database lalu apply migration + `supabase/seed.sql`
- `pnpm supabase:stop`: mematikan stack Supabase lokal
- `pnpm auth:bootstrap-demo`: memastikan akun demo CSSD tersedia di Supabase Auth dan row `profiles` sinkron berdasarkan `user_id`

## Asumsi Seed Role

File [supabase/seed.sql](E:/PROJEK%20TTEH/.worktrees/ncis-cssd-mvp/supabase/seed.sql) menyiapkan data awal:

- profile `ADMIN_CSSD`
- profile `PETUGAS_CSSD`
- beberapa satuan default
- beberapa unit rumah sakit default

Seed ini hanya mengisi tabel internal aplikasi. User login Supabase Auth dibuat terpisah:

- lokal/dev: lewat `pnpm auth:bootstrap-demo`
- produksi: buat user di Supabase Dashboard Auth, lalu isi `public.profiles.user_id` dengan UUID user Auth tersebut dan set `app_role` yang sesuai

Role CSSD aplikasi sekarang dibaca dari `public.profiles`, bukan dijadikan sumber utama dari metadata user.

## Supabase Auth Lokal

Alur yang direkomendasikan untuk development:

1. isi `.env.local`
2. jalankan `pnpm local:dev` untuk setup pertama, atau `pnpm local:quick` untuk startup harian yang lebih ringan
3. login memakai:
   - `admin.cssd@ncis.local`
   - `petugas.cssd@ncis.local`

Jika bootstrap gagal dengan error env, berarti `.env.local` belum lengkap. Jika stack lokal repo ini bermasalah di Windows Docker, jalankan `pnpm local:fix`.

Catatan:

- `pnpm local:fix` dan `pnpm local:clean` hanya menarget stack dengan `project_id = ncis-cssd-mvp`
- jika port default Supabase dipakai project lain, command ini tidak akan mematikan project lain tersebut
- `pnpm supabase:start` sengaja mengecualikan service opsional seperti Studio, Storage API, dan pgMeta agar startup lokal lebih stabil di Windows

## Perintah Test dan Quality Gate

Jalankan sesuai kebutuhan:

```bash
pnpm lint
pnpm exec tsc --noEmit
pnpm vitest run
pnpm build
```

Atau gunakan satu perintah ringkas:

```bash
pnpm check
```

Perintah test terpisah:

```bash
pnpm test
pnpm test:unit
pnpm test:unit:compat
pnpm test:integration
```

Catatan performa lokal:

- `pnpm test:unit` memakai pool `threads` dengan `1 worker` agar tetap lebih cepat dari mode `forks`, tetapi stabil di filesystem lokal Windows yang lambat.
- Jika ada library atau test tertentu yang butuh mode paling konservatif, pakai `pnpm test:unit:compat`.

## Alur Verifikasi Manual CSSD

Sebelum rilis, minimal cek alur berikut:

- master data `Item`, `Satuan`, dan `Unit`
- pemasukan stok
- distribusi ke unit
- pengembalian reusable
- perpindahan reusable ke `Tidak Steril`, `Area Sterilisasi`, lalu `Siap Pakai`
- pemakaian internal
- stok opname draft dan finalisasi
- laporan

## Catatan UI

Untuk pekerjaan UI yang lebih berat di iterasi berikutnya, jalankan dulu:

```bash
npx ui-skills start
```

Di environment Windows saat pengerjaan terakhir, perintah ini masih gagal dengan `npm error Invalid Version:`. Jadi bila error yang sama muncul, lanjutkan UI dengan pola komponen repo saat ini sambil investigasi dependensi `ui-skills`.

## Deployment

Target deployment saat ini:

- frontend ke Vercel
- database dan auth ke Supabase Cloud

Sebelum deploy, pastikan environment di Vercel sudah diisi:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

Jika nanti menambah server-side integration yang butuh hak admin, baru tambahkan secret terpisah dan jangan expose ke client.
