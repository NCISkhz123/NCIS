# NCIS copy guidelines

Panduan ini menjadi acuan tetap untuk copy NCIS agar semua halaman terasa operasional, singkat, dan mudah dipakai oleh staf.

## Prinsip utama

1. Gunakan bahasa kerja yang langsung ke tugas.
2. Hindari istilah teknis produk seperti `workspace`, `shell`, `placeholder`, `server action`, `state`, atau istilah implementasi lain.
3. Gunakan kalimat pendek. Satu heading, satu tujuan.
4. Jelaskan tindakan yang harus dilakukan user, bukan cara sistem dibuat.
5. Gunakan sentence case untuk semua judul, label, tombol, dan pesan.
6. Jika satu bagian sudah jelas dari judulnya, jangan ulangi penjelasan yang sama di paragraf berikutnya.

## Pola penulisan

### Judul halaman

- Pakai nama pekerjaan, bukan nama teknis halaman.
- Contoh benar: `Pemasukan`, `Distribusi`, `Pengembalian reusable`, `Stok opname`
- Contoh yang dihindari: `Transaksi CSSD`, `Form distribusi`, `Manajemen stok reusable`

### Deskripsi singkat

- Maksimal 1 kalimat pendek.
- Fokus pada hasil kerja user.
- Contoh benar: `Catat barang masuk ke stok CSSD.`
- Contoh yang dihindari: `Halaman ini digunakan untuk melakukan pencatatan transaksi pemasukan barang ke dalam sistem.`

### Label panel

- Gunakan label ringkas yang berulang konsisten di seluruh modul:
  - `Input`
  - `Riwayat`
  - `Posisi stok`
  - `Proses reusable`
  - `Draft`
  - `Sesi`

### Tombol

- Gunakan kata kerja aktif.
- Contoh: `Simpan pemasukan`, `Simpan distribusi`, `Buat draft`, `Finalisasi hasil`

### Empty state

- Singkat, netral, dan informatif.
- Contoh: `Belum ada transaksi`, `Belum ada stok`, `Belum ada sesi final`

### Error dan sukses

- Jangan gunakan nada dramatis.
- Contoh error: `Data belum bisa disimpan. Coba lagi.`
- Contoh sukses: `Pemasukan berhasil disimpan.`

## Istilah operasional tetap

### CSSD

- `Steril`
- `Tidak Steril`
- `Area Sterilisasi`
- `Rusak`

### Laundry

- `Bersih`
- `Kotor`
- `Area Pencucian`
- `Rusak`

## Aturan per modul

- Gunakan nama modul di konteks yang memang perlu pembeda, misalnya `stok CSSD` atau `stok Laundry`.
- Jangan ulang nama modul di setiap judul kecil jika konteks halaman sudah jelas.
- Untuk panel stok dan riwayat, prioritaskan istilah kerja seperti `stok saat ini`, `transaksi terbaru`, atau `hasil tersimpan`.

## Checklist sebelum merge

1. Apakah ada istilah teknis internal yang masih tampil ke user?
2. Apakah judul bisa dipendekkan tanpa menghilangkan makna?
3. Apakah tombol memakai kata kerja aktif?
4. Apakah istilah CSSD dan Laundry sudah sesuai kamus operasional di atas?
5. Apakah satu panel hanya punya satu pesan utama?
