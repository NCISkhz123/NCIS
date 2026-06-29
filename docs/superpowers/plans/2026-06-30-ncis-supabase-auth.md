# NCIS Supabase Auth Implementation Plan

> **For agentic workers:** REQUIRED: Use `executing-plans` to implement this plan. Keep task order unless a later step is explicitly unblocked first. Use checkbox updates in this file as progress markers during execution.

**Goal:** Mengganti auth placeholder NCIS menjadi auth Supabase sungguhan berbasis email + password, dengan login/logout aktif, proteksi SSR yang stabil, role CSSD yang tetap dihormati, dan akun demo lokal yang bisa dibootstrap tanpa mengubah alur produksi.

**Architecture:** Next.js App Router memakai `@supabase/ssr` untuk session server/browser, `public.profiles` menjadi sumber role utama, role disinkronkan ke token Supabase agar RLS dan guard tetap konsisten, dan akun demo lokal dibuat lewat service-role utility yang hanya berjalan di server/dev.

**Tech Stack:** Next.js 16, React 19, TypeScript, Supabase Auth, Supabase Postgres, Zod env validation, Vitest, Testing Library.

**Spec Reference:** [docs/superpowers/specs/2026-06-30-ncis-supabase-auth-design.md](/E:/PROJEK%20TTEH/.worktrees/ncis-cssd-mvp/docs/superpowers/specs/2026-06-30-ncis-supabase-auth-design.md)

---

## Locked Decisions

- Login method: email + password.
- Scope awal: login + logout saja, belum ada CRUD user/role di aplikasi.
- Produksi: user dibuat manual di Supabase Dashboard.
- Development lokal: siapkan demo users dari `.env.local`.
- Sumber role aplikasi: `public.profiles.app_role`.
- Modul aktif tetap CSSD dulu, tetapi fondasi auth harus bisa dipakai modul lain nanti.

---

## File Map

**Database / Supabase**

- [supabase/migrations](</E:/PROJEK TTEH/.worktrees/ncis-cssd-mvp/supabase/migrations>)
- [supabase/seed.sql](/E:/PROJEK%20TTEH/.worktrees/ncis-cssd-mvp/supabase/seed.sql)

**Auth / Env / Supabase**

- [src/lib/env.ts](/E:/PROJEK%20TTEH/.worktrees/ncis-cssd-mvp/src/lib/env.ts)
- [src/lib/auth/profile.ts](/E:/PROJEK%20TTEH/.worktrees/ncis-cssd-mvp/src/lib/auth/profile.ts)
- [src/lib/auth/guards.ts](/E:/PROJEK%20TTEH/.worktrees/ncis-cssd-mvp/src/lib/auth/guards.ts)
- [src/lib/supabase/server.ts](/E:/PROJEK%20TTEH/.worktrees/ncis-cssd-mvp/src/lib/supabase/server.ts)
- [src/lib/supabase/client.ts](/E:/PROJEK%20TTEH/.worktrees/ncis-cssd-mvp/src/lib/supabase/client.ts)
- [src/lib/supabase/middleware.ts](/E:/PROJEK%20TTEH/.worktrees/ncis-cssd-mvp/src/lib/supabase/middleware.ts)
- [middleware.ts](/E:/PROJEK%20TTEH/.worktrees/ncis-cssd-mvp/middleware.ts)
- [src/lib/supabase/admin.ts](/E:/PROJEK%20TTEH/.worktrees/ncis-cssd-mvp/src/lib/supabase/admin.ts)
- [src/lib/auth/demo-users.ts](/E:/PROJEK%20TTEH/.worktrees/ncis-cssd-mvp/src/lib/auth/demo-users.ts)

**UI / App Router**

- [src/app/(auth)/login/page.tsx](/E:/PROJEK%20TTEH/.worktrees/ncis-cssd-mvp/src/app/(auth)/login/page.tsx)
- [src/app/(auth)/login/actions.ts](/E:/PROJEK%20TTEH/.worktrees/ncis-cssd-mvp/src/app/(auth)/login/actions.ts)
- [src/app/(protected)/layout.tsx](/E:/PROJEK%20TTEH/.worktrees/ncis-cssd-mvp/src/app/(protected)/layout.tsx)
- [src/components/layout/module-header.tsx](/E:/PROJEK%20TTEH/.worktrees/ncis-cssd-mvp/src/components/layout/module-header.tsx)

**Scripts / Docs**

- [.env.example](/E:/PROJEK%20TTEH/.worktrees/ncis-cssd-mvp/.env.example)
- [package.json](/E:/PROJEK%20TTEH/.worktrees/ncis-cssd-mvp/package.json)
- [README.md](/E:/PROJEK%20TTEH/.worktrees/ncis-cssd-mvp/README.md)

**Tests**

- [tests/integration/auth/guards.test.ts](/E:/PROJEK%20TTEH/.worktrees/ncis-cssd-mvp/tests/integration/auth/guards.test.ts)
- [tests/integration/auth/profile-access.test.ts](/E:/PROJEK%20TTEH/.worktrees/ncis-cssd-mvp/tests/integration/auth/profile-access.test.ts)
- [tests/unit/auth/login-actions.test.ts](/E:/PROJEK%20TTEH/.worktrees/ncis-cssd-mvp/tests/unit/auth/login-actions.test.ts)
- [tests/unit/auth/demo-users.test.ts](/E:/PROJEK%20TTEH/.worktrees/ncis-cssd-mvp/tests/unit/auth/demo-users.test.ts)

---

## Task 1: Perkuat Skema Auth dan Akses `profiles`

- [ ] Tambahkan migration baru untuk memastikan user yang login bisa membaca profilnya sendiri lewat `auth.uid() = user_id`.
- [ ] Pertahankan kebijakan role CSSD yang sudah ada agar akses operasional CSSD tidak regresi.
- [ ] Tambahkan mekanisme sinkronisasi role dari `public.profiles.app_role` ke metadata/claim yang dipakai `public.current_app_role()`.
- [ ] Jika implementasi hook auth Supabase butuh fungsi SQL tambahan, simpan di migration yang sama agar setup lokal tetap satu jalur.
- [ ] Tambahkan integration test yang awalnya gagal untuk membuktikan:
  - user authenticated bisa membaca row `profiles` miliknya sendiri;
  - role CSSD dari profile tetap dikenali oleh fungsi auth SQL;
  - user tanpa profile aktif tidak mendapat role CSSD.

**Implementation Notes**

- Gunakan migration baru, jangan edit migration historis.
- Pastikan desain tetap kompatibel dengan seed demo CSSD yang sudah ada.
- Jika claim role tidak bisa langsung diuji end-to-end lewat Auth hook lokal, uji fungsi SQL sumber claim-nya secara terpisah.

**Suggested Commands**

```bash
pnpm vitest run tests/integration/auth/profile-access.test.ts
pnpm supabase db reset
pnpm vitest run tests/integration/auth/profile-access.test.ts
```

**Checkpoint Commit**

- `test: cover profile-based auth access`
- `feat: align profile policies with supabase auth`

---

## Task 2: Siapkan Env, Admin Client, dan Bootstrap Demo User

- [ ] Perluas validasi env di [src/lib/env.ts](/E:/PROJEK%20TTEH/.worktrees/ncis-cssd-mvp/src/lib/env.ts) untuk memisahkan public env dan server-only env.
- [ ] Tambahkan entri baru di [.env.example](/E:/PROJEK%20TTEH/.worktrees/ncis-cssd-mvp/.env.example):
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `NCIS_DEMO_ADMIN_PASSWORD`
  - `NCIS_DEMO_PETUGAS_PASSWORD`
- [ ] Buat helper server-only di [src/lib/supabase/admin.ts](/E:/PROJEK%20TTEH/.worktrees/ncis-cssd-mvp/src/lib/supabase/admin.ts) untuk client admin Supabase.
- [ ] Buat service idempoten di [src/lib/auth/demo-users.ts](/E:/PROJEK%20TTEH/.worktrees/ncis-cssd-mvp/src/lib/auth/demo-users.ts) untuk:
  - memastikan akun auth demo ada;
  - mengikat email demo dengan profile yang sesuai;
  - menghindari duplikasi jika dijalankan berulang.
- [ ] Tambahkan script bootstrap demo user ke `package.json`, misalnya `pnpm auth:bootstrap-demo`.
- [ ] Tulis unit test yang memverifikasi service bootstrap bekerja benar saat user belum ada, sudah ada, atau profile tidak sinkron.

**Implementation Notes**

- Gunakan `supabase.auth.admin.createUser()` dengan `email_confirm: true`.
- Password demo tidak boleh di-hardcode di source code.
- Pisahkan logic bisnis bootstrap dari script runner supaya mudah diuji.

**Suggested Commands**

```bash
pnpm vitest run tests/unit/auth/demo-users.test.ts
pnpm auth:bootstrap-demo
```

**Checkpoint Commit**

- `test: cover demo auth bootstrap service`
- `feat: add demo supabase auth bootstrap`

---

## Task 3: Implement Login Page, Server Action, dan Logout

- [ ] Jalankan `npx ui-skills start` sebelum mengerjakan UI login agar pola motion/dialog selaras dengan tool UI yang diminta.
- [ ] Ganti placeholder login di [src/app/(auth)/login/page.tsx](/E:/PROJEK%20TTEH/.worktrees/ncis-cssd-mvp/src/app/(auth)/login/page.tsx) menjadi form login production-ready untuk email + password.
- [ ] Tambahkan server action di [src/app/(auth)/login/actions.ts](/E:/PROJEK%20TTEH/.worktrees/ncis-cssd-mvp/src/app/(auth)/login/actions.ts) untuk:
  - validasi input;
  - `signInWithPassword`;
  - redirect ke area protected setelah sukses;
  - menampilkan pesan error yang aman bila gagal.
- [ ] Tambahkan logout action dari area protected, paling masuk akal di header shell yang sudah ada.
- [ ] Update [src/components/layout/module-header.tsx](/E:/PROJEK%20TTEH/.worktrees/ncis-cssd-mvp/src/components/layout/module-header.tsx) agar user bisa logout tanpa mengganggu pemilih modul di header.
- [ ] Pastikan user yang sudah login dan membuka `/login` diarahkan kembali ke area kerja yang sesuai.

**Implementation Notes**

- Pertahankan branding NCIS yang sudah dibesarkan pada sidebar/header.
- Jangan tambah dashboard baru; arahkan user ke entry CSSD yang sudah ada.
- Pakai server action untuk auth submit, bukan fetch client manual.

**Suggested Commands**

```bash
pnpm vitest run tests/unit/auth/login-actions.test.ts
pnpm dev
```

**Manual Smoke Checks**

- Login berhasil dengan `admin.cssd@ncis.local`.
- Login gagal menampilkan pesan validasi yang jelas.
- Logout menghapus session dan mengembalikan user ke `/login`.
- Akses `/login` saat sudah login langsung redirect ke route CSSD.

**Checkpoint Commit**

- `test: cover supabase login actions`
- `feat: add ncis supabase login and logout`

---

## Task 4: Hubungkan Session SSR, Middleware, dan Resolusi Profil

- [ ] Update [src/lib/auth/profile.ts](/E:/PROJEK%20TTEH/.worktrees/ncis-cssd-mvp/src/lib/auth/profile.ts) agar membaca profil nyata dari tabel `public.profiles`, bukan hanya metadata user.
- [ ] Pastikan hasil `getCurrentProfile()` tetap memuat informasi yang dibutuhkan layout CSSD seperti email, full name, dan role.
- [ ] Buat atau aktifkan [middleware.ts](/E:/PROJEK%20TTEH/.worktrees/ncis-cssd-mvp/middleware.ts) di root project untuk memanggil `updateSession()` pada route yang relevan.
- [ ] Review [src/lib/auth/guards.ts](/E:/PROJEK%20TTEH/.worktrees/ncis-cssd-mvp/src/lib/auth/guards.ts) supaya redirect login, akses forbidden, dan role CSSD tetap konsisten setelah source-of-truth pindah ke `profiles`.
- [ ] Tambahkan regression test untuk guard logic atau profile resolution bila ada perubahan perilaku.

**Implementation Notes**

- Ikuti pola SSR Supabase resmi: buat client, segera panggil `auth.getUser()`, lalu teruskan response yang sama.
- Matcher middleware harus mengecualikan asset statis dan route internal Next.js.
- Jangan jadikan middleware sebagai satu-satunya otorisasi; server guard tetap wajib.

**Suggested Commands**

```bash
pnpm vitest run tests/integration/auth/guards.test.ts tests/integration/auth/profile-access.test.ts
pnpm build
```

**Checkpoint Commit**

- `feat: connect profiles and ssr auth guards`

---

## Task 5: Dokumentasi, Verifikasi, dan Handover

- [ ] Update [README.md](/E:/PROJEK%20TTEH/.worktrees/ncis-cssd-mvp/README.md) dengan langkah env, bootstrap akun demo, login lokal, dan alur produksi membuat user.
- [ ] Tinjau ulang [supabase/seed.sql](/E:/PROJEK%20TTEH/.worktrees/ncis-cssd-mvp/supabase/seed.sql) agar tetap cocok dengan flow auth baru.
- [ ] Jalankan verifikasi akhir lint/test/build dan reset database lokal bila perlu.
- [ ] Catat risiko tersisa, khususnya:
  - rotasi password demo;
  - sinkronisasi profile bila user produksi dinonaktifkan;
  - ekspansi role untuk modul Laundry dan Ambulance nanti.

**Suggested Commands**

```bash
pnpm check
pnpm vitest run
pnpm build
pnpm supabase db reset
```

**Definition of Done**

- Login/logout Supabase berjalan end-to-end di lokal.
- CSSD protected routes memakai session nyata.
- Role CSSD berasal dari `public.profiles`.
- Demo users lokal bisa dibootstrap ulang dengan aman.
- README cukup jelas untuk setup developer berikutnya.

**Final Commit**

- `docs: document ncis supabase auth flow`

---

## Execution Order

1. Task 1
2. Task 2
3. Task 3
4. Task 4
5. Task 5

Urutan ini sengaja dimulai dari fondasi database dan env supaya UI login tidak dibangun di atas auth contract yang masih berubah.
