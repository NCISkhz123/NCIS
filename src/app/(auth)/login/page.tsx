export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6 py-12">
      <section className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="space-y-2">
          <p className="text-sm font-medium uppercase tracking-[0.24em] text-slate-500">
            NCIS
          </p>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-950">
            Login CSSD
          </h1>
          <p className="text-sm leading-6 text-slate-600">
            Halaman login sementara untuk fondasi autentikasi NCIS. Integrasi
            Supabase Auth akan dilengkapi setelah schema dan role database
            selesai.
          </p>
        </div>
      </section>
    </main>
  );
}
