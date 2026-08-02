'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { completeAmbulanceOrder } from '@/app/(protected)/ambulance/order/actions';
import { 
  Truck, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  Radio, 
  ShieldCheck, 
  Navigation, 
  ArrowLeft, 
  DollarSign, 
  History,
  PlusCircle,
  Activity,
  Timer,
  Compass,
  AlertTriangle,
  Printer
} from 'lucide-react';

const TrackingMap = dynamic(() => import('./AmbulanceTrackingMap'), {
  ssr: false,
  loading: () => (
    <div className="h-[520px] w-full bg-slate-900 animate-pulse rounded-2xl flex flex-col items-center justify-center gap-3 border border-slate-800 text-white">
      <Radio className="h-8 w-8 text-sky-400 animate-spin" />
      <span className="text-sm font-medium text-slate-300">Menghubungkan ke Telemetri Radar GPS...</span>
    </div>
  )
});

export type ActiveTransactionDetail = {
  id: string;
  ambulance_id: string;
  destination_lat: number;
  destination_lng: number;
  distance_km: number;
  total_cost: number;
  status: string;
  completed_at: string | null;
  created_at: string;
  ambulances: {
    name: string;
    plate_number: string;
    base_price_per_km: number;
    image_url: string | null;
  } | null;
};

interface AmbulanceTrackingViewProps {
  transaction: ActiveTransactionDetail;
  hospitalCoords: [number, number];
}

export function AmbulanceTrackingView({ transaction, hospitalCoords }: AmbulanceTrackingViewProps) {
  const router = useRouter();
  const [isPending, startTransition] = React.useTransition();
  const [copied, setCopied] = React.useState(false);

  const destCoords: [number, number] = [transaction.destination_lat, transaction.destination_lng];
  const isCompleted = transaction.status === 'COMPLETED';

  // Calculate estimated times based on ~45 km/h average speed in urban emergency drive
  const distanceKm = transaction.distance_km;
  const minutesOneWay = Math.max(5, Math.round((distanceKm / 45) * 60));
  const minutesReturn = minutesOneWay * 2 + 10; // includes 10 min patient handling

  const handleCompleteOrder = () => {
    startTransition(async () => {
      const res = await completeAmbulanceOrder(transaction.id);
      if (res.error) {
        toast.error("Gagal memperbarui status: " + res.error);
      } else {
        toast.success("Ambulans telah kembali ke RS! Status penugasan SELESAI.");
        router.refresh();
      }
    });
  };

  const copyId = () => {
    navigator.clipboard.writeText(transaction.id);
    setCopied(true);
    toast.success("ID Transaksi berhasil disalin!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full space-y-6">
      {/* Top Banner Navigation & HUD Status */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900 border border-slate-800 text-white shadow-xl">
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            size="icon" 
            onClick={() => router.push('/ambulance/order')}
            className="h-10 w-10 rounded-xl bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700 hover:text-white shrink-0"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-black tracking-tight text-white">Telemetri Real-Time Ambulans</h1>
              {isCompleted ? (
                <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/40 font-bold text-xs">
                  <CheckCircle2 className="h-3 w-3 mr-1" /> SELESAI
                </Badge>
              ) : (
                <Badge className="bg-rose-500/20 text-rose-300 border-rose-500/40 font-bold text-xs animate-pulse">
                  <Radio className="h-3 w-3 mr-1 animate-spin" /> DISPOSISI AKTIF
                </Badge>
              )}
            </div>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              ID: <button onClick={copyId} className="hover:text-sky-400 underline decoration-dashed">{transaction.id}</button> {copied && "✓"}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto justify-end">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => window.open(`/ambulance/print/${transaction.id}`, '_blank')}
            className="h-9 rounded-xl bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700 hover:text-white text-xs font-semibold"
          >
            <Printer className="h-4 w-4 mr-1.5 text-sky-400" /> Cetak / PDF Nota
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => router.push('/ambulance/history')}
            className="h-9 rounded-xl bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white text-xs font-semibold"
          >
            <History className="h-4 w-4 mr-1.5" /> Riwayat Transaksi
          </Button>
          <Button 
            size="sm"
            onClick={() => router.push('/ambulance/order')}
            className="h-9 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold shadow-md shadow-sky-600/30"
          >
            <PlusCircle className="h-4 w-4 mr-1.5" /> Pesan Unit Baru
          </Button>
        </div>
      </div>

      {/* Main Grid Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full">
        {/* Left Column: Interactive GPS Radar Map (8 Cols) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-lg flex flex-col">
            <div className="p-4 border-b border-slate-100 bg-slate-50/70 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                <Compass className="h-4 w-4 text-sky-600 animate-spin" />
                <span>Peta Rute Navigasi (Pangkalan RS &rarr; Lokasi Tujuan &rarr; Pangkalan RS)</span>
              </div>
              <span className="text-[11px] font-mono text-slate-500 font-medium">OSRM GPS Engine</span>
            </div>

            <div className="h-[520px] w-full relative">
              <TrackingMap hospitalCoords={hospitalCoords} destCoords={destCoords} />

              {/* Map Floating HUD Overlay */}
              <div className="absolute top-4 right-4 z-[500] bg-slate-900/90 backdrop-blur-md border border-slate-800 p-3.5 rounded-xl shadow-2xl text-white space-y-2 text-xs max-w-xs">
                <div className="flex items-center justify-between gap-4 border-b border-slate-800 pb-2">
                  <span className="text-slate-400 font-medium flex items-center gap-1.5">
                    <Activity className="h-3.5 w-3.5 text-emerald-400" /> Kecepatan Rata-rata
                  </span>
                  <span className="font-mono font-bold text-emerald-400">~45 km/jam</span>
                </div>
                <div className="flex items-center justify-between gap-4 border-b border-slate-800 pb-2">
                  <span className="text-slate-400 font-medium flex items-center gap-1.5">
                    <Navigation className="h-3.5 w-3.5 text-sky-400" /> Total Jarak PP (2x)
                  </span>
                  <span className="font-mono font-bold text-sky-400">{(distanceKm * 2).toFixed(2)} km</span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-slate-400 font-medium flex items-center gap-1.5">
                    <Timer className="h-3.5 w-3.5 text-amber-400" /> Perkiraan Kembali RS
                  </span>
                  <span className="font-mono font-bold text-amber-400">~{minutesReturn} Menit</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Mission Control & Finish Action (4 Cols) */}
        <div className="lg:col-span-4 space-y-4">
          {/* Action Card: Selesaikan Pesanan */}
          <Card className="rounded-2xl border-slate-200 bg-white shadow-md overflow-hidden">
            <CardHeader className="p-4 pb-3 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                <span>Status & Kontrol Penugasan</span>
              </div>
              <CardTitle className="text-base font-black text-slate-900">
                {isCompleted ? "Penugasan Selesai" : "Disposisi Sedang Berjalan"}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              {isCompleted ? (
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 space-y-2 text-center">
                  <CheckCircle2 className="h-10 w-10 text-emerald-600 mx-auto" />
                  <div>
                    <h4 className="text-sm font-extrabold text-emerald-900">Ambulans Telah Masuk RS</h4>
                    <p className="text-xs text-emerald-700 mt-0.5">
                      Unit telah menyelesaikan misi medis dan saat ini berstatus Siaga untuk pemesanan berikutnya.
                    </p>
                  </div>
                  {transaction.completed_at && (
                    <div className="pt-2 border-t border-emerald-200/70 text-[11px] font-mono text-emerald-800">
                      Diselesaikan: {new Date(transaction.completed_at).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 space-y-2">
                  <div className="flex items-start gap-2.5">
                    <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wide">Ambulans Dalam Penggunaan</h4>
                      <p className="text-xs text-amber-800 mt-1 leading-relaxed">
                        Armada ini <strong className="font-bold">terkunci</strong> dan tidak dapat dipesan oleh user mana pun sampai tombol di bawah ditekan saat ambulans telah kembali ke RS.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Complete Action Button or New Order Button */}
              {isCompleted ? (
                <Button 
                  onClick={() => router.push('/ambulance/order')}
                  className="w-full h-11 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-extrabold text-xs tracking-wider uppercase shadow-md shadow-sky-600/20"
                >
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Buat Pesanan Baru
                </Button>
              ) : (
                <Button 
                  onClick={handleCompleteOrder}
                  disabled={isPending}
                  className="w-full h-12 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs tracking-wider uppercase shadow-lg shadow-emerald-600/30 transition-all hover:scale-[1.01] active:scale-[0.99]"
                >
                  {isPending ? (
                    <span className="flex items-center gap-2">
                      <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Memproses Kepulangan...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <CheckCircle2 className="h-5 w-5" />
                      <span>Pesanan Selesai (Ambulans Kembali ke RS)</span>
                    </span>
                  )}
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Unit & Mission Details */}
          <Card className="rounded-2xl border-slate-200 bg-white shadow-md">
            <CardHeader className="p-4 pb-3 border-b border-slate-100">
              <CardTitle className="text-sm font-extrabold text-slate-900">Rincian Armada & Biaya</CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3.5">
              {/* Unit Info */}
              <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                <div className="h-10 w-10 rounded-lg bg-sky-600 text-white flex items-center justify-center font-bold shrink-0">
                  <Truck className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="font-extrabold text-slate-900 text-sm block truncate">
                    {transaction.ambulances?.name || 'Unit Ambulans'}
                  </span>
                  <span className="text-xs font-mono font-semibold text-slate-500">
                    Plat: {transaction.ambulances?.plate_number || '-'}
                  </span>
                </div>
              </div>

              {/* Destination Coords */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Koordinat Tujuan Pasien</span>
                <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-slate-800">
                  <MapPin className="h-4 w-4 text-rose-500 shrink-0" />
                  <span>{transaction.destination_lat.toFixed(5)}, {transaction.destination_lng.toFixed(5)}</span>
                </div>
              </div>

              {/* Cost Summary */}
              <div className="p-4 rounded-xl bg-sky-50/70 border border-sky-200/80 space-y-1">
                <div className="flex items-center justify-between text-xs text-sky-800 font-semibold uppercase tracking-wider">
                  <span>Total Tagihan Rute PP</span>
                  <span className="font-mono text-[11px]">2x {distanceKm.toFixed(2)} km</span>
                </div>
                <span className="text-2xl font-black text-sky-600 block">
                  {transaction.total_cost.toLocaleString('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                </span>
                <p className="text-[10px] text-sky-700/80 pt-1 border-t border-sky-200/60">
                  Dihitung otomatis berdasarkan tarif Rp {new Intl.NumberFormat('id-ID').format(transaction.ambulances?.base_price_per_km || 0)} / km (Pulang-Pergi).
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Mission Timeline */}
          <Card className="rounded-2xl border-slate-200 bg-white shadow-md">
            <CardHeader className="p-4 pb-2 border-b border-slate-100">
              <CardTitle className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">
                Alur Tahapan Penugasan Medis
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="space-y-4 relative before:absolute before:left-3.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                <div className="flex items-start gap-3 relative z-10">
                  <div className="h-7 w-7 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold shrink-0">
                    1
                  </div>
                  <div>
                    <span className="text-xs font-extrabold text-slate-900 block">Disposisi Diterbitkan</span>
                    <span className="text-[11px] text-slate-500">
                      {new Date(transaction.created_at).toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' })}
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3 relative z-10">
                  <div className={`h-7 w-7 rounded-full ${isCompleted ? 'bg-emerald-600 text-white' : 'bg-sky-600 text-white'} flex items-center justify-center text-xs font-bold shrink-0`}>
                    2
                  </div>
                  <div>
                    <span className="text-xs font-extrabold text-slate-900 block">Perjalanan Ke Tujuan Pasien</span>
                    <span className="text-[11px] text-slate-500">Est. Tiba: ~{minutesOneWay} Menit</span>
                  </div>
                </div>

                <div className="flex items-start gap-3 relative z-10">
                  <div className={`h-7 w-7 rounded-full ${isCompleted ? 'bg-emerald-600 text-white' : 'bg-slate-300 text-slate-600'} flex items-center justify-center text-xs font-bold shrink-0`}>
                    3
                  </div>
                  <div>
                    <span className="text-xs font-extrabold text-slate-900 block">Kepulangan & Penyerahan Pasien ke RS</span>
                    <span className="text-[11px] text-slate-500">
                      {isCompleted ? "Tiba kembali di RS" : "Proses perjalanan pulang ke RS"}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
