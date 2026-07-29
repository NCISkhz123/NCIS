# Design Spec: Tryout Review / Pembahasan Page Overhaul

## 1. Overview & Objectives

Desain baru halaman Review Pembahasan Tryout yang mengadopsi 100% struktur visual dan layout dari **Halaman Try Out (Screenshot 1)**, diperkaya dengan indikator evaluasi jawaban dan box penjelasan/pembahasan (seperti di **Screenshot 2**).

Tujuan utama:
1. Memberikan pengalaman navigasi soal yang mudah dengan sidebar grid nomor 1-50.
2. Menunjukkan status kebenaran jawaban pada grid nomor navigasi (Hijau = Benar, Merah = Salah).
3. Menyorot pilihan jawaban pada soal (Jawaban Benar = Hijau, Jawaban Salah User = Merah).
4. Menyediakan area **Pembahasan & Penjelasan** persis di bawah pilihan ganda (posisi lingkaran kuning Screenshot 1).
5. Menyediakan filter ringkas `"Hanya jawaban salah"` pada header statistik.

---

## 2. Layout & UI Component Specifications

### 2.1 Header Ringkasan Try Out (Top Section)
* **Status Card**:
  * Judul: "Try Out Besar" dengan Badge "Try out"
  * Metric Boxes:
    * **SKOR**: Jumlah nilai/skor
    * **JAWABAN BENAR**: Jumlah soal dijawab benar (teks/icon hijau)
    * **JAWABAN SALAH**: Jumlah soal dijawab salah (teks/icon merah)
    * **TANGGAL SUBMIT**: Timestamp penyelesaian
* **Filter Quick Access**:
  * Checkbox / Switch `"Hanya jawaban salah"` untuk menyaring navigasi nomor & tampilan soal.

---

### 2.2 Sidebar Navigasi Soal (Left Column - `col-span-3` / `col-span-4`)
* **Header**: "NAVIGASI SOAL" (teks cyan/teal uppercase, tracking-wider).
* **Grid Navigasi Nomor (1 - 50)**:
  * Grid 4 kolom dengan tombol rounded rectangular.
  * **Soal Benar**: Latar hijau soft (`bg-emerald-100 text-emerald-800 border-emerald-300 hover:bg-emerald-200`).
  * **Soal Salah**: Latar merah soft (`bg-rose-100 text-rose-800 border-rose-300 hover:bg-rose-200`).
  * **Nomor Aktif**: Cyan ring/border tebal (`ring-2 ring-cyan-500 font-bold`).
* **Interaktivitas**: Mengklik nomor akan langsung mengubah soal aktif di sebelah kanan.

---

### 2.3 Main View (Right Column - `col-span-9` / `col-span-8`)

#### A. Header Soal
* Pill badge kategori (contoh: `Clinical Science` warna cyan/blue outline).
* Teks Counter Soal: **Soal X dari N** (contoh: `Soal 1 dari 50`).
* Status Evaluasi Soal (Badge):
  * `✓ Jawabanmu Benar` (Badge Emerald/Green) jika user menjawab benar.
  * `✕ Jawabanmu Salah` (Badge Rose/Red) jika user menjawab salah.

#### B. Pertanyaan & Pilihan Ganda (A, B, C, D, E)
* Teks Narasi Soal (Font size 15-16px, line-height comfortable).
* **Pilihan Ganda (Rounded Pill Container)**:
  * Lingkaran huruf A, B, C, D, E di sisi kiri.
  * Teks opsi jawaban di sisi kanan.
  * **Status Warna Opsi**:
    * **Opsi Jawaban Benar (Kunci)**: Background & Border **Hijau** (`bg-emerald-50 border-emerald-500 text-emerald-900`) + Badge Label `✓ Jawaban Benar`.
    * **Opsi Pilihan User yang Salah**: Background & Border **Merah** (`bg-rose-50 border-rose-500 text-rose-900`) + Badge Label `✕ Jawabanmu (Salah)`.
    * **Opsi Netral (Bukan pilihan user & bukan kunci)**: Border standar abu-abu (`border-slate-200 bg-white text-slate-700`).

#### C. Box Pembahasan & Penjelasan (Area Lingkaran Kuning)
* Terletak di bawah pilihan E dan di atas tombol navigasi `Sebelumnya / Selanjutnya`.
* Styling Container: Rounded card `rounded-xl border border-slate-200 bg-slate-50 p-5 shadow-sm`.
* **Sub-Header**: Badge **PENJELASAN** (cyan/blue badge).
* **Konten**:
  * Teks penjelasan medis/klinis lengkap.
  * Referensi / Dokumen acuan (misal: *Referensi: PNPK Tata Laksana HIV 2019*).

#### D. Tombol Navigasi Bawah
* Tombol `← Sebelumnya` (Button border outline).
* Tombol `Selanjutnya →` (Solid Cyan rounded-full button `bg-cyan-500 text-white hover:bg-cyan-600`).

---

## 3. Data Structure & State Management

```typescript
export interface ReviewOption {
  id: string; // 'A' | 'B' | 'C' | 'D' | 'E'
  text: string;
}

export interface ReviewQuestion {
  id: number;
  number: number;
  category: string;
  questionText: string;
  options: ReviewOption[];
  userAnswerId: string; // ID pilihan yang dipilih user
  correctAnswerId: string; // ID pilihan jawaban benar
  isCorrect: boolean;
  explanation: string;
  reference?: string;
}

export interface TryoutReviewSummary {
  title: string;
  totalScore: number;
  correctCount: number;
  wrongCount: number;
  submitDate: string;
  questions: ReviewQuestion[];
}
```

---

## 4. Route Location & Replacement Strategy

1. **Dedicated Route**: `src/app/(protected)/tryout/review/page.tsx`
2. **Components**:
   - `src/components/tryout/tryout-review-view.tsx`
   - `src/components/tryout/tryout-navigation-sidebar.tsx`
   - `src/components/tryout/tryout-question-card.tsx`
   - `src/components/tryout/tryout-pembahasan-box.tsx`
3. **Pembersihan Halaman Lama**: Setelah halaman baru diverifikasi dan disetujui, halaman/modul review lama yang tidak terpakai akan dihapus dari repositori.

---

## 5. Verification Plan

1. **Unit & Visual Checks**:
   - Uji navigasi klik nomor 1-50 di sidebar kiri (perubahan soal aktif).
   - Verifikasi warna hijau pada soal benar dan warna merah pada soal salah di sidebar.
   - Verifikasi highlight hijau pada kunci jawaban & highlight merah pada pilihan user yang salah.
   - Verifikasi munculnya Box Pembahasan persis di bawah pilihan ganda.
   - Verifikasi fungsionalitas tombol `Sebelumnya` & `Selanjutnya`.
   - Verifikasi toggle filter `"Hanya jawaban salah"`.
2. **Build & Typecheck**:
   - Jalankan `pnpm typecheck` dan `pnpm lint` untuk memastikan zero errors.
