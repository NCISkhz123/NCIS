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

3. Jalankan Supabase lokal:

```bash
pnpm supabase:start
```

4. Ambil nilai berikut dari output `pnpm supabase:status`, lalu isi di `.env.local`:

- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NCIS_DEMO_ADMIN_PASSWORD`
- `NCIS_DEMO_PETUGAS_PASSWORD`

5. Pastikan `NEXT_PUBLIC_SUPABASE_URL` cocok dengan API URL lokal Supabase. Default repo ini memakai:

```env
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:55321
```

6. Jalankan aplikasi:

```bash
pnpm dev
```

7. Bootstrap akun demo lokal:

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
pnpm supabase:start
pnpm supabase:status
pnpm supabase:reset
pnpm supabase:stop
pnpm auth:bootstrap-demo
```

Keterangan:

- `pnpm supabase:start`: menyalakan stack Supabase lokal
- `pnpm supabase:status`: melihat URL, key, dan service status lokal
- `pnpm supabase:reset`: reset database lalu apply migration + `supabase/seed.sql`
- `pnpm supabase:stop`: mematikan stack Supabase lokal
- `pnpm auth:bootstrap-demo`: memastikan akun demo CSSD tersedia di Supabase Auth dan row `profiles` sinkron

## Asumsi Seed Role

File [supabase/seed.sql](E:/PROJEK%20TTEH/.worktrees/ncis-cssd-mvp/supabase/seed.sql) menyiapkan data awal:

- profile `ADMIN_CSSD`
- profile `PETUGAS_CSSD`
- beberapa satuan default
- beberapa unit rumah sakit default

Seed ini hanya mengisi tabel internal aplikasi. User login Supabase Auth dibuat terpisah:

- lokal/dev: lewat `pnpm auth:bootstrap-demo`
- produksi: manual lewat Supabase Dashboard Auth, lalu profile dicocokkan lewat email/role

Role CSSD aplikasi sekarang dibaca dari `public.profiles`, bukan dijadikan sumber utama dari metadata user.

## Supabase Auth Lokal

Alur yang direkomendasikan untuk development:

1. `pnpm supabase:start`
2. `pnpm supabase:reset`
3. isi `.env.local`
4. `pnpm auth:bootstrap-demo`
5. login memakai:
   - `admin.cssd@ncis.local`
   - `petugas.cssd@ncis.local`

Jika bootstrap gagal dengan error env, berarti `.env.local` belum lengkap. Jika `supabase:start` tidak sehat di Windows Docker, jalankan `pnpm supabase:stop -- --no-backup` lalu start ulang.

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
pnpm test:integration
```

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
