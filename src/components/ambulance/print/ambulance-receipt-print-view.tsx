'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Printer, 
  ArrowLeft, 
  Truck, 
  MapPin, 
  Calendar, 
  ShieldCheck, 
  Clock, 
  FileText,
  Building2,
  Phone,
  CheckCircle2,
  Radio
} from 'lucide-react';

const TrackingMap = dynamic(() => import('../tracking/AmbulanceTrackingMap'), {
  ssr: false,
  loading: () => (
    <div className="h-64 w-full bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 text-xs font-medium">
      Memuat Peta GPS...
    </div>
  )
});

export type PrintReceiptDetail = {
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

interface AmbulanceReceiptPrintViewProps {
  transaction: PrintReceiptDetail;
  hospitalCoords: [number, number];
}

export function AmbulanceReceiptPrintView({ transaction, hospitalCoords }: AmbulanceReceiptPrintViewProps) {
  const router = useRouter();
  const destCoords: [number, number] = [transaction.destination_lat, transaction.destination_lng];
  const isCompleted = transaction.status === 'COMPLETED';

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="w-full min-h-screen bg-slate-100/60 p-4 sm:p-8 print:p-0 print:bg-white print:min-h-0">
      {/* Floating Action Bar (Hidden when printing) */}
      <div className="max-w-4xl mx-auto mb-6 flex flex-col sm:flex-row items-center justify-between gap-4 print:hidden bg-slate-900 text-white p-4 rounded-2xl shadow-lg">
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => router.back()}
            className="rounded-xl bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4 mr-1.5" /> Kembali
          </Button>
          <div>
            <h2 className="text-sm font-extrabold text-white">Nota Disposisi & Peta Rute Ambulans</h2>
            <p className="text-xs text-slate-400 font-mono">ID: {transaction.id}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Button 
            onClick={handlePrint}
            className="w-full sm:w-auto rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs shadow-md shadow-sky-600/30 px-5 h-10"
          >
            <Printer className="h-4 w-4 mr-2" /> Cetak / Unduh PDF Nota
          </Button>
        </div>
      </div>

      {/* Main Printable Receipt Document Container */}
      <div className="max-w-4xl mx-auto bg-white border border-slate-200/90 rounded-2xl shadow-xl p-6 sm:p-10 print:shadow-none print:border-none print:p-0 print:m-0 text-slate-900 space-y-6">
        {/* Header / Kop Surat Resmi RS NCIS */}
        <div className="border-b-2 border-slate-900 pb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-sky-600 text-white flex items-center justify-center font-black text-xl shadow-md shrink-0 print:bg-slate-900">
              NCIS
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-900 tracking-tight uppercase">RUMAH SAKIT NCIS EMERGENCY</h1>
              <p className="text-xs text-slate-500 font-medium">Instalasi Ambulans & Layanan Misi Medis Darurat 24 Jam</p>
              <p className="text-[11px] text-slate-400 font-mono mt-0.5">Jl. Layanan Kesehatan No. 1 • Telp: (021) 555-9999</p>
            </div>
          </div>

          <div className="text-left sm:text-right font-mono">
            <span className="inline-block px-3 py-1 bg-slate-100 text-slate-900 font-bold text-xs rounded-md border border-slate-200 print:border-slate-900">
              NOTA DISPOSISI AMBULANS
            </span>
            <div className="text-xs text-slate-500 mt-1">
              No: <strong className="text-slate-900 font-bold">{transaction.id.slice(0, 8).toUpperCase()}</strong>
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              Waktu: {new Date(transaction.created_at).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}
            </div>
          </div>
        </div>

        {/* Section 1: Peta Jarak Rute Tempuh */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <MapPin className="h-4 w-4 text-rose-500" />
              <span>Peta Visual Rute & Jarak Tempuh</span>
            </h3>
            <span className="text-[11px] font-mono font-bold text-slate-500">
              Jarak Pulang-Pergi: {(transaction.distance_km * 2).toFixed(2)} km
            </span>
          </div>

          <div className="h-64 w-full rounded-xl border border-slate-200 overflow-hidden relative shadow-inner print:border-slate-400">
            <TrackingMap hospitalCoords={hospitalCoords} destCoords={destCoords} />
          </div>

          {/* Location Details Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/80">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Titik Keberangkatan</span>
              <span className="font-extrabold text-slate-900 block mt-0.5">Pangkalan Utama RS NCIS</span>
              <span className="font-mono text-[11px] text-slate-500">
                {hospitalCoords[0].toFixed(5)}, {hospitalCoords[1].toFixed(5)}
              </span>
            </div>
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/80">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Titik Tujuan Pasien</span>
              <span className="font-extrabold text-slate-900 block mt-0.5">Koordinat Penjemputan Darurat</span>
              <span className="font-mono text-[11px] text-slate-500">
                {transaction.destination_lat.toFixed(5)}, {transaction.destination_lng.toFixed(5)}
              </span>
            </div>
          </div>
        </div>

        {/* Section 2: Nota Rincian Transaksi */}
        <div className="space-y-3 pt-2 border-t border-slate-200">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
            <FileText className="h-4 w-4 text-sky-600" />
            <span>Rincian Tagihan & Armada Unit</span>
          </h3>

          <div className="border border-slate-200 rounded-xl overflow-hidden print:border-slate-900">
            <table className="w-full text-xs">
              <thead className="bg-slate-100 border-b border-slate-200 print:bg-slate-200">
                <tr>
                  <th className="py-2.5 px-4 text-left font-bold text-slate-700 uppercase tracking-wider">Komponen Disposisi</th>
                  <th className="py-2.5 px-4 text-center font-bold text-slate-700 uppercase tracking-wider">Spesifikasi / Tarif</th>
                  <th className="py-2.5 px-4 text-right font-bold text-slate-700 uppercase tracking-wider">Jumlah Subtotal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 print:divide-slate-300">
                <tr>
                  <td className="py-3 px-4">
                    <div className="font-extrabold text-slate-900 text-sm">
                      {transaction.ambulances?.name || 'Unit Ambulans Emergency'}
                    </div>
                    <div className="text-[11px] font-mono text-slate-500">
                      Plat Nomor: {transaction.ambulances?.plate_number || '-'}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-center font-mono">
                    Rp {new Intl.NumberFormat('id-ID').format(transaction.ambulances?.base_price_per_km || 0)} / km
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                    Rp {new Intl.NumberFormat('id-ID').format(transaction.ambulances?.base_price_per_km || 0)}
                  </td>
                </tr>

                <tr>
                  <td className="py-3 px-4">
                    <div className="font-bold text-slate-900">Jarak Rute Pulang-Pergi (2x Jarak Peta)</div>
                    <div className="text-[11px] text-slate-500 font-mono">
                      {transaction.distance_km.toFixed(2)} km x 2 (Perjalanan PP)
                    </div>
                  </td>
                  <td className="py-3 px-4 text-center font-mono font-bold">
                    {(transaction.distance_km * 2).toFixed(2)} km
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                    Rp {new Intl.NumberFormat('id-ID').format((transaction.distance_km * 2) * (transaction.ambulances?.base_price_per_km || 0))}
                  </td>
                </tr>

                <tr className="bg-slate-50 font-black print:bg-slate-100">
                  <td colSpan={2} className="py-3.5 px-4 text-right uppercase tracking-wider text-slate-900 text-xs">
                    TOTAL TAGIHAN BIAYA DISPOSISI:
                  </td>
                  <td className="py-3.5 px-4 text-right text-base font-black text-sky-600 print:text-slate-900">
                    {transaction.total_cost.toLocaleString('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Section 3: Status & Legal Authorization Footer */}
        <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 text-xs">
          <div className="space-y-1 text-slate-500 text-[11px]">
            <p className="font-bold text-slate-700">Status Penugasan Medis:</p>
            <div className="flex items-center gap-2">
              {isCompleted ? (
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold font-mono">
                  SELESAI (Ambulans Telah Kembali ke RS)
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold font-mono">
                  DALAM TUGAS (Penugasan Berjalan)
                </span>
              )}
            </div>
            {transaction.completed_at && (
              <p className="font-mono text-[10px]">
                Waktu Selesai: {new Date(transaction.completed_at).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}
              </p>
            )}
            <p className="text-[10px] text-slate-400 italic pt-1">
              * Nota ini diterbitkan secara otomatis oleh Sistem Manajemen Ambulans RS NCIS dan berlaku sebagai bukti sah disposisi kendaraan emergency.
            </p>
          </div>

          <div className="text-center font-mono space-y-12 self-end w-full sm:w-56 shrink-0 pt-4 sm:pt-0">
            <div>
              <p className="text-[11px] text-slate-500">Petugas Disposisi Ambulans</p>
              <p className="text-[10px] text-slate-400">RS NCIS Emergency</p>
            </div>
            <div className="border-b border-slate-900 pb-1">
              <span className="font-bold text-slate-900 text-xs">( ____________________ )</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
