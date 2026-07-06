# NCIS module header and sidebar simplification design

## Summary

NCIS akan menyederhanakan shell layout modul CSSD dan Laundry agar area kerja utama lebih lega dan fokus ke konten halaman. Panel header besar di atas konten akan dihapus, pemilihan modul dipindahkan ke sidebar kiri untuk desktop dan ke utility row ringkas untuk viewport kecil, dan detail dekoratif di grup navigasi akan dibersihkan.

Tujuan utama perubahan ini adalah mengurangi hambatan visual tanpa mengubah struktur route, akses modul, atau perilaku dasar navigasi yang sudah dipakai operator.

Desain ini mengikuti pola komponen yang sudah ada sekarang:

- shell modul tetap memakai `AppSidebar` dan `ModuleHeader`
- daftar modul tetap bersumber dari `NCIS_MODULES`
- grup navigasi tetap memakai pola expand/collapse di `SidebarNav`
- route meta tetap menjadi sumber judul dan deskripsi halaman aktif

## Goals

- Menghilangkan panel header besar yang memakan ruang di semua modul.
- Memindahkan pemilihan modul ke area sidebar agar lebih ringkas.
- Menjaga perpindahan modul tetap cepat untuk user multi-modul.
- Menghapus detail teks sekunder seperti jumlah menu dan deskripsi grup di sidebar.
- Mempertahankan perilaku expand/collapse dan state aktif pada navigasi.

## Non-goals

- Tidak mengubah aturan akses role atau daftar modul.
- Tidak mengubah route modul atau struktur halaman transaksi/master data.
- Tidak mendesain ulang visual logout beyond kebutuhan menjaga akses yang sudah ada.
- Tidak mengubah data business logic, query, atau server action.
- Tidak membuat sistem navigasi baru di luar shell layout yang sudah ada.

## Dependencies and assumptions

- Shell saat ini menaruh satu-satunya affordance `Logout` di area header yang akan dihapus, jadi perubahan ini tidak boleh menghilangkan akses logout terakhir.
- Model role saat ini masih berbasis modul tunggal (`ADMIN_CSSD`, `PETUGAS_CSSD`, `ADMIN_LAUNDRY`, `PETUGAS_LAUNDRY`), tetapi UI switcher harus tetap kompatibel bila nanti ada role multi-modul seperti superadmin.
- Layout saat ini menyembunyikan `AppSidebar` di viewport di bawah `lg`, jadi desain harus mendefinisikan fallback pemilih modul untuk mobile dan tablet kecil.
- Route meta sudah ada untuk route utama, tetapi header tetap membutuhkan fallback yang deterministic bila exact route meta tidak tersedia.
- Perubahan ini tidak menambah sistem navigasi halaman baru untuk mobile; di viewport kecil, yang ditambahkan hanya module switcher dan logout ringkas.
- Ketiadaan affordance navigasi halaman per-menu di viewport di bawah `lg` dianggap keterbatasan yang tetap diterima pada rollout ini; perubahan ini tidak memperbaiki area tersebut dan itu bukan regression blocker untuk task ini.

## Current state

Shell layout protected module saat ini terdiri dari:

- sidebar kiri dengan identitas `NCIS` dan badge modul statis
- header atas besar yang memuat:
  - kartu identitas `NCIS + nama modul`
  - panel `Pindah Modul`
  - panel `Akun`
- sidebar group seperti `Master Data` dan `Laporan` yang menampilkan:
  - badge jumlah submenu, misalnya `3 Menu`
  - deskripsi grup
  - kontrol teks `Buka` dan `Tutup`

Masalah UX utamanya:

- area atas konten terlalu dominan dibanding isi halaman
- perpindahan modul ditempatkan terlalu jauh dari identitas modul di sidebar
- sidebar group terasa ramai karena memuat metadata yang tidak penting untuk kerja harian
- fokus user terpecah antara shell UI dan konten utama halaman

## Chosen direction

Pendekatan yang dipilih adalah menyederhanakan shell layout sambil mempertahankan struktur komponen yang sama, dengan satu pengecualian responsif: module switcher berada di sidebar pada desktop dan di utility row `ModuleHeader` pada viewport kecil.

Keputusan utamanya:

- `ModuleHeader` diperkecil menjadi header halaman aktif saja
- `AppSidebar` menjadi lokasi tunggal untuk identitas modul dan pemilihan modul
- `SidebarNav` dibersihkan menjadi label grup + daftar submenu + state aktif

Pendekatan ini dipilih karena:

- memberi hasil visual paling terasa tanpa refactor arsitektur besar
- menjaga perilaku route dan data tetap aman
- berlaku konsisten untuk CSSD dan Laundry
- paling sesuai dengan arahan user untuk menghilangkan area yang menghalangi

## UX structure

### 1. Module header

`ModuleHeader` hanya menampilkan konteks halaman aktif:

- label kecil `Halaman aktif`
- judul halaman aktif dari route meta
- deskripsi singkat halaman dari route meta

Kontrak fallback:

- bila exact route meta tersedia, gunakan meta tersebut
- untuk path yang diawali `/cssd/master-data`, gunakan meta `/cssd/master-data/items`
- untuk path yang diawali `/cssd/laporan`, gunakan meta `/cssd/laporan`
- untuk path yang diawali `/laundry/master-data`, gunakan meta `/laundry/master-data/items`
- untuk path yang diawali `/laundry/laporan`, gunakan meta `/laundry/laporan`
- fallback terakhir tetap `Modul CSSD` atau `Modul Laundry` beserta deskripsi default modul, sehingga header tidak pernah kosong

Bagian berikut dihapus dari header:

- kartu `NCIS`
- panel `Pindah Modul`
- panel `Akun`

Khusus logout:

- panel akun besar dihapus
- aksi `Logout` tetap dipertahankan sebagai kontrol ringkas terpisah di shell, bukan di dalam panel akun
- di desktop, `Logout` dimiliki oleh area footer `AppSidebar`
- di mobile dan tablet kecil, `Logout` dimiliki oleh utility row ringkas di `ModuleHeader`
- rollout ini menganggap penempatan tersebut sebagai acceptance rule final untuk perubahan ini; yang bisa dibahas nanti hanya styling minor, bukan lokasinya
- implementasi tidak boleh menghilangkan akses logout pada breakpoint mana pun

Header tetap menjadi boundary visual antar shell dan konten, tetapi tidak lagi menjadi area dashboard mini.

### 2. Sidebar module switcher

Badge `CSSD Module` atau `Laundry Module` di bawah identitas `NCIS` berubah menjadi trigger interaktif.

Perilaku yang dipilih:

- klik badge membuka popover kecil
- popover menampilkan tiga opsi modul dari `NCIS_MODULES`
- modul aktif diberi state aktif
- modul dengan `href: "#"` tampil disabled
- modul tanpa akses dari profil aktif juga tampil disabled, bukan disembunyikan
- klik di luar popover menutup popover
- klik modul aktif tidak melakukan navigasi
- klik modul lain yang enabled akan pindah ke root modul tersebut

Lokasi ini dipilih karena secara mental paling dekat dengan identitas modul saat ini.

Aturan availability yang dipilih:

- daftar opsi tetap mengikuti urutan `NCIS_MODULES`
- enabled/disabled ditentukan oleh akses modul profil aktif
- untuk role saat ini, CSSD role hanya mengaktifkan `CSSD` dan Laundry role hanya mengaktifkan `Laundry`
- bila nanti ada role multi-modul, UI yang sama cukup menandai lebih dari satu opsi sebagai enabled tanpa perubahan struktur

### 3. Sidebar group cleanup

Untuk grup seperti `Master Data` dan `Laporan`, elemen yang dipertahankan hanya:

- label grup
- indikator expand/collapse berbasis ikon kecil
- daftar submenu saat grup terbuka
- state aktif pada grup dan submenu

Elemen yang dihapus:

- badge jumlah submenu seperti `3 Menu`
- deskripsi grup seperti `Item, satuan, dan unit CSSD`
- label teks `Buka` dan `Tutup`

Tujuannya adalah membuat navigasi lebih cepat dipindai tanpa mengurangi fungsi.

## Component strategy

Perubahan akan dipusatkan pada shell layout yang ada, dengan dua unit kecil shared agar kontraknya jelas:

- `src/components/layout/module-header.tsx`
- `src/components/layout/app-sidebar.tsx`
- `src/components/layout/sidebar-nav.tsx`
- `src/components/layout/module-switcher.tsx` sebagai shared client unit untuk daftar modul, state terbuka, keyboard behavior, dan close behavior
- `src/components/layout/logout-button.tsx` sebagai shared shell action untuk tombol logout ringkas di desktop dan mobile

Data yang tetap dipakai:

- `NCIS_MODULES` dari `src/lib/cssd/constants.ts`
- `CSSD_NAV_ITEMS` dan `LAUNDRY_NAV_ITEMS`
- `CSSD_ROUTE_META` dan `LAUNDRY_ROUTE_META`

Interface yang direkomendasikan:

- layout server component mengambil profil aktif seperti sekarang
- helper `getAvailableModuleKeys(role: AppRole): readonly ModuleKey[]` menjadi source of truth tunggal untuk mapping role -> module availability
- helper tersebut diletakkan di layer auth shared, tetapi pada task ini consumer yang wajib hanya protected layouts; pemakaian oleh login/redirect auth flow berada di luar scope perubahan ini
- layout server component memanggil helper itu lalu meneruskan `availableModuleKeys`, `activeModuleKey`, dan `logoutAction` ke shell components
- `ModuleSwitcher` hanya menerima data yang sudah siap render; ia tidak membaca auth profile langsung
- `AppSidebar` memakai `ModuleSwitcher` untuk desktop dan `LogoutButton` di footer sidebar
- `ModuleHeader` memakai `ModuleSwitcher` versi utility row untuk mobile/tablet kecil dan `LogoutButton` ringkas pada row yang sama
- `SidebarNav` tetap fokus pada grup navigasi; ia tidak mengetahui akses modul atau logout
- `SidebarNavItem.description` tetap boleh tinggal di constants pada tahap ini meski tidak dirender, agar perubahan tetap fokus pada UI dan tidak melebar ke type cleanup
- bila `role` tidak dikenali, helper mengembalikan array kosong
- bila `activeModuleKey` tidak termasuk dalam `availableModuleKeys`, shell tetap menampilkan modul sesuai pathname saat ini sebagai active-only fallback dan menandai opsi lain disabled

Strateginya adalah mengurangi markup dan menambah interaksi kecil lokal, bukan memindahkan tanggung jawab ke layer baru.

## Interaction details

### Module switcher

- default state tertutup
- pola semantics yang dipakai adalah `button` trigger + popover berisi daftar tombol/link biasa, bukan `menu` atau `listbox`
- badge modul tetap terlihat meski user hanya punya satu modul aktif
- popover memakai ukuran kecil yang cukup untuk tiga opsi modul
- opsi aktif diberi penanda visual yang jelas
- opsi disabled tidak melakukan navigasi
- opsi disabled tidak masuk tab order, memakai `aria-disabled="true"`, dan diumumkan sebagai item tidak tersedia
- klik opsi aktif selalu no-op pada desktop dan mobile, dan popover tetap terbuka
- klik opsi disabled selalu no-op pada desktop dan mobile, dan popover tetap terbuka
- klik opsi enabled yang bukan aktif selalu menutup popover lalu menuju root modul target pada desktop dan mobile
- `Enter` atau `Space` pada trigger membuka popover
- `Escape` menutup popover dan mengembalikan fokus ke trigger
- saat popover terbuka, `Tab` berpindah antar opsi yang terlihat tanpa focus trap penuh
- klik di luar menutup popover tanpa memaksa fokus kembali ke trigger
- focus yang keluar dari region trigger + popover melalui alur tab normal menutup popover dan membiarkan fokus lanjut ke target berikutnya

### Sidebar groups

- group tetap auto-expand saat route aktif berada di dalam segment grup
- user tetap bisa toggle group secara manual
- state toggle lokal tetap dipertahankan dengan `useState`
- ikon expand/collapse harus tetap terbaca di tema sidebar gelap

### Responsive behavior

- di desktop, shell tetap dua area: sidebar kiri dan konten kanan
- di mobile dan tablet kecil, karena sidebar disembunyikan, pemilih modul dipindah ke utility row ringkas di `ModuleHeader`
- utility row mobile hanya memuat trigger modul aktif dan logout ringkas, tanpa mengembalikan panel besar lama
- perilaku opsi modul di mobile sama dengan desktop: daftar konsisten, enabled/disabled sama, klik opsi aktif no-op, dan klik opsi enabled lain menuju root modul target
- navigasi halaman per-menu di viewport kecil tetap mengikuti perilaku aplikasi saat ini dan tidak diperluas dalam perubahan ini
- status tersebut dianggap accepted limitation untuk rollout ini dan bukan regression blocker
- popover modul harus tetap menempel ke trigger dan tidak keluar viewport

## Accessibility

- trigger pemilihan modul harus berupa button yang bisa diakses keyboard
- popover harus memiliki label konteks yang jelas
- state terbuka/tertutup pada pemilih modul dan grup navigasi harus terekspos lewat atribut ARIA yang sesuai
- opsi disabled harus terbaca sebagai tidak tersedia
- ikon expand/collapse tidak boleh menjadi satu-satunya penanda state tanpa `aria-expanded`
- saat popover ditutup lewat `Escape`, fokus kembali ke trigger modul
- saat popover ditutup lewat klik luar atau tab-forward normal, fokus mengikuti target interaksi user berikutnya

## Testing strategy

### Component behavior

- `ModuleHeader` tetap menampilkan judul dan deskripsi halaman aktif
- `SidebarNav` tetap auto-expand untuk route dalam grup aktif
- `SidebarNav` tetap bisa ditoggle manual
- `AppSidebar` menampilkan module switcher dan opsi modul aktif
- `ModuleSwitcher` menutup popover saat klik luar
- `ModuleSwitcher` mengembalikan fokus ke trigger saat ditutup lewat `Escape`
- `ModuleSwitcher` tidak menavigasi saat opsi aktif dipilih
- `ModuleSwitcher` tidak menavigasi saat opsi disabled dipilih
- `ModuleSwitcher` tetap terbuka saat opsi aktif atau disabled dipilih
- `ModuleSwitcher` menutup diri sebelum navigasi saat opsi enabled lain dipilih
- `ModuleSwitcher` merender semantics button/popover yang konsisten di desktop dan `< lg`

### Regression coverage

- test CSSD shell layout tetap pass dengan struktur header baru
- test Laundry shell layout mengikuti perilaku yang sama
- disabled module seperti `Ambulance` tetap tidak diperlakukan sebagai link aktif
- logout tetap tersedia setelah panel akun besar dihapus
- fallback header tetap aman untuk route yang tidak punya exact meta
- mobile utility row tetap menampilkan module switcher dan logout ringkas saat sidebar tersembunyi

### Technical verification

- jalankan targeted Vitest untuk komponen layout
- jalankan typecheck
- lakukan browser pass singkat untuk CSSD dan Laundry pada desktop dan mobile

## Acceptance matrix

| Area | Desktop | Mobile / tablet kecil |
|---|---|---|
| Header halaman | Hanya `Halaman aktif`, judul, deskripsi | Hanya `Halaman aktif`, judul, deskripsi, plus utility row ringkas |
| Module switcher | Di bawah `NCIS` pada sidebar | Di utility row `ModuleHeader` |
| Active module click | No-op | No-op |
| Enabled inactive module click | Navigasi ke root modul | Navigasi ke root modul |
| Disabled module click | No-op | No-op |
| Popover after active click | Tetap terbuka | Tetap terbuka |
| Popover after disabled click | Tetap terbuka | Tetap terbuka |
| Popover after enabled inactive click | Menutup lalu navigasi | Menutup lalu navigasi |
| Logout | Footer `AppSidebar` | Utility row `ModuleHeader` |
| Sidebar groups | Expand/collapse dengan ikon | Tidak tampil bila sidebar tersembunyi |

## Risks and mitigations

### Risk: module switcher baru terasa ambigu

Mitigasi:

- pertahankan label eksplisit `CSSD Module` / `Laundry Module`
- tampilkan daftar modul dengan nama yang jelas, bukan ikon saja

### Risk: penghapusan detail sidebar membuat grup terasa terlalu polos

Mitigasi:

- pertahankan highlight aktif yang kuat
- pertahankan spacing dan hierarchy antar grup dan submenu

### Risk: menghapus panel akun memutus akses logout sementara

Mitigasi:

- rollout harus memindahkan logout ke kontrol ringkas yang sudah ditentukan dalam spec ini
- implementasi tidak boleh menghapus affordance logout terakhir pada desktop maupun mobile

## Recommendation

Sederhanakan shell layout NCIS dengan mengubah header atas menjadi header halaman aktif saja, memindahkan pemilihan modul ke badge interaktif di sidebar, dan menghapus metadata sekunder pada grup navigasi. Pendekatan ini paling sesuai dengan kebutuhan user untuk mengurangi gangguan visual sambil menjaga perilaku navigasi inti tetap stabil.
