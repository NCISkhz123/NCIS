import { TryoutReviewSummary } from "@/types/tryout";

const mockQuestions = Array.from({ length: 50 }, (_, i) => {
  const num = i + 1;
  if (num === 1) {
    return {
      id: 1,
      number: 1,
      category: "Clinical Science",
      questionText:
        "Seorang pria 62 tahun dengan riwayat osteoartritis datang mengeluhkan nyeri lutut yang semakin parah. Pasien juga memiliki riwayat gastritis kronis dan sering kambuh bila minum obat penghilang nyeri tertentu. Dokter ingin memberikan obat yang lebih aman terhadap lambung. Obat analgesik apa yang lebih sesuai diberikan pada pasien osteoartritis dengan riwayat gastritis ini?",
      options: [
        { id: "A", text: "Ibuprofen" },
        { id: "B", text: "Naproxen" },
        { id: "C", text: "Asam mefenamat" },
        { id: "D", text: "Celecoxib" },
        { id: "E", text: "Ketoprofen" },
      ],
      userAnswerId: "A",
      correctAnswerId: "D",
      isCorrect: false,
      explanation:
        "Celecoxib adalah obat antiinflamasi nonsteroid (OAINS) selektif penghambat COX-2. Penghambatan selektif COX-2 memberikan efek analgesik dan antiinflamasi tanpa mengganggu fungsi protektif lambung yang dimediasi oleh COX-1, sehingga lebih aman bagi pasien dengan riwayat gastritis atau ulkus peptikum dibanding OAINS non-selektif seperti Ibuprofen, Naproxen, Asam mefenamat, atau Ketoprofen.",
      reference: "Pedoman Penatalaksanaan Nyeri & Osteoartritis 2021",
    };
  }

  if (num === 2) {
    return {
      id: 2,
      number: 2,
      category: "Clinical Science",
      questionText:
        "Seorang pria datang ke dokter untuk memeriksakan keadaannya. Pasien merupakan seorang ODHA, dan saat ini merasakan sariawan di mulutnya. Dokter mendiagnosis pasien dengan candidiasis oral, akan tetapi nistatin sebagai pilihan pertama terapi sedang kosong. Obat apakah yang dapat digunakan sebagai pengganti Nistatin?",
      options: [
        { id: "A", text: "Ketokonazole" },
        { id: "B", text: "Flukonazole" },
        { id: "C", text: "Griseofulvin" },
        { id: "D", text: "Amfoterisin B" },
        { id: "E", text: "Terbinafin" },
      ],
      userAnswerId: "B",
      correctAnswerId: "B",
      isCorrect: true,
      explanation:
        "Pada pasien dengan infeksi HIV dan mengalami candidiasis oral dapat diberikan Flukonazole sebagai alternatif Nistatin oral suspension apabila Nistatin tidak tersedia.",
      reference: "PNPK Tata Laksana HIV 2019",
    };
  }

  const isCorr = num % 2 === 0;
  return {
    id: num,
    number: num,
    category: num % 3 === 0 ? "Pharmaceutical Science" : "Clinical Science",
    questionText: `Soal latihan nomor ${num}: Seorang pasien dirawat dengan diagnosa spesifik. Formulasi obat manakah yang paling sesuai untuk kondisi klinis pasien ini berdasarkan panduan praktik klinis?`,
    options: [
      { id: "A", text: `Pilihan formulasi obat A untuk soal ${num}` },
      { id: "B", text: `Pilihan formulasi obat B untuk soal ${num}` },
      { id: "C", text: `Pilihan formulasi obat C untuk soal ${num}` },
      { id: "D", text: `Pilihan formulasi obat D untuk soal ${num}` },
      { id: "E", text: `Pilihan formulasi obat E untuk soal ${num}` },
    ],
    userAnswerId: isCorr ? "A" : "C",
    correctAnswerId: "A",
    isCorrect: isCorr,
    explanation: `Pembahasan rinci untuk soal nomor ${num}: Opsi A adalah jawaban yang paling tepat berdasarkan mekanisme kerja dan profil keamanan obat.`,
    reference: "Kompendium Farmakoterapi 2024",
  };
});

const correctCount = mockQuestions.filter((q) => q.isCorrect).length;
const wrongCount = mockQuestions.filter((q) => !q.isCorrect).length;

export const mockTryoutReviewData: TryoutReviewSummary = {
  title: "Try Out Besar",
  totalScore: correctCount,
  correctCount,
  wrongCount,
  submitDate: "27 Jul, 10.38",
  questions: mockQuestions,
};
