"use client";

import { useState, useTransition } from "react";
import { Database } from "@/types/supabase";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { createAmbulanceOrder } from "@/app/(protected)/ambulance/order/actions";
import { toast } from "sonner";
import { 
  Truck, 
  MapPin, 
  Navigation, 
  ArrowRight, 
  ArrowLeft, 
  DollarSign, 
  Sparkles,
  AlertCircle,
  Radio
} from "lucide-react";

const MapComponent = dynamic(() => import('@/components/ambulance/AmbulanceMap'), { 
  ssr: false,
  loading: () => (
    <div className="h-[550px] w-full bg-slate-900/90 animate-pulse rounded-2xl flex flex-col items-center justify-center gap-3 border border-slate-800 text-white">
      <Radio className="h-8 w-8 text-sky-400 animate-pulse" />
      <span className="text-sm font-medium text-slate-300">Menghubungkan ke Peta GPS Ambulans...</span>
    </div>
  )
});

type Ambulance = Database["public"]["Tables"]["ambulances"]["Row"] & {
  is_in_use?: boolean;
  active_transaction_id?: string | null;
};

export function OrderWizard({ ambulances, hospitalCoords }: { ambulances: Ambulance[], hospitalCoords: [number, number] }) {
  const [step, setStep] = useState<1 | 2>(1);
  const [selectedCar, setSelectedCar] = useState<Ambulance | null>(null);
  const [distanceKm, setDistanceKm] = useState<number | null>(null);
  const [destination, setDestination] = useState<[number, number] | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleRouteCalculated = (dist: number, dest: [number, number]) => {
    setDistanceKm(dist);
    setDestination(dest);
  };

  const handleCheckout = () => {
    if (!selectedCar || !distanceKm || !destination) return;
    
    startTransition(async () => {
      const roundedDistance = Number(distanceKm.toFixed(2));
      const res = await createAmbulanceOrder({
        ambulance_id: selectedCar.id,
        destination_lat: destination[0],
        destination_lng: destination[1],
        distance_km: roundedDistance,
      });

      if (res.error) {
        toast.error("Gagal membuat pesanan: " + res.error);
      } else if (res.id) {
        toast.success("Disposisi Ambulans Berhasil Dikirim!");
        router.push(`/ambulance/tracking/${res.id}`);
      }
    });
  };

  return (
    <div className="w-full">
      {step === 1 ? (
        <div className="w-full">
          {ambulances.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
              <AlertCircle className="mx-auto h-10 w-10 text-amber-500 mb-3" />
              <h3 className="text-base font-bold text-slate-900">Tidak Ada Armada Siaga</h3>
              <p className="text-xs text-slate-500 mt-1">Belum ada unit ambulans aktif yang terdaftar di master data.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 w-full">
              {ambulances.map((ambulance) => {
                const isSelected = selectedCar?.id === ambulance.id;
                const isInUse = Boolean(ambulance.is_in_use);

                return (
                  <Card 
                    key={ambulance.id} 
                    className={cn(
                      "group flex flex-col overflow-hidden transition-all duration-200 border-slate-200/90 bg-white",
                      isInUse ? "opacity-90 border-amber-300 bg-amber-50/10 shadow-xs" : isSelected ? "ring-2 ring-sky-500 border-sky-500 bg-sky-50/20 shadow-xl" : "hover:border-sky-300 hover:shadow-xl"
                    )}
                  >
                    <div className="p-4 pb-2 flex items-center justify-between border-b border-slate-100">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-1 rounded-md text-[11px] font-mono font-bold bg-slate-900 text-white">
                          {ambulance.plate_number}
                        </span>
                      </div>
                      {isInUse ? (
                        <Badge className="bg-rose-50 text-rose-700 border-rose-200 font-bold text-[11px] animate-pulse">
                          Sedang Bertugas
                        </Badge>
                      ) : (
                        <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 font-bold text-[11px]">
                          Siaga
                        </Badge>
                      )}
                    </div>

                    <CardContent className="p-4 space-y-3 flex-1">
                      <div>
                        <h3 className="text-base font-extrabold text-slate-900 group-hover:text-sky-600 transition-colors">
                          {ambulance.name}
                        </h3>
                        <p className="text-xs text-slate-500 font-medium mt-0.5">
                          {isInUse ? "Sedang dalam misi darurat medis" : "Unit Penanganan Medis Emergency"}
                        </p>
                      </div>

                      {/* Image Preview Container */}
                      <div className="aspect-video w-full rounded-xl bg-slate-100 relative overflow-hidden border border-slate-200/80">
                        {ambulance.image_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img 
                            src={ambulance.image_url} 
                            alt={ambulance.name} 
                            className={cn(
                              "object-cover w-full h-full transition-transform duration-300",
                              !isInUse && "group-hover:scale-105"
                            )} 
                          />
                        ) : (
                          <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-1.5">
                            <Truck className="h-8 w-8 stroke-1 text-slate-400" />
                            <span className="text-[11px] font-medium">Foto Armada Unit</span>
                          </div>
                        )}
                      </div>

                      {/* Price Badge */}
                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 flex items-center justify-between text-xs">
                        <span className="text-slate-500 font-medium">Tarif Dasar Rute</span>
                        <span className="font-extrabold text-slate-900">
                          Rp {new Intl.NumberFormat('id-ID').format(ambulance.base_price_per_km)} <span className="text-slate-400 font-normal">/ km</span>
                        </span>
                      </div>
                    </CardContent>

                    <CardFooter className="p-4 pt-0">
                      {isInUse ? (
                        ambulance.active_transaction_id ? (
                          <Button 
                            className="w-full h-10 rounded-xl font-bold text-xs tracking-wide bg-amber-600 hover:bg-amber-700 text-white shadow-xs"
                            onClick={() => router.push(`/ambulance/tracking/${ambulance.active_transaction_id}`)}
                          >
                            <Radio className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                            Pantau Disposisi
                          </Button>
                        ) : (
                          <Button 
                            disabled
                            className="w-full h-10 rounded-xl font-bold text-xs tracking-wide bg-slate-200 text-slate-500 cursor-not-allowed shadow-none"
                          >
                            Sedang Bertugas
                          </Button>
                        )
                      ) : (
                        <Button 
                          className={cn(
                            "w-full h-10 rounded-xl font-bold text-xs tracking-wide transition-all shadow-xs",
                            isSelected ? "bg-sky-600 hover:bg-sky-700 text-white" : "bg-slate-900 hover:bg-slate-800 text-white"
                          )} 
                          onClick={() => {
                            setSelectedCar(ambulance);
                            setStep(2);
                          }}
                        >
                          Pilih Armada Ini
                          <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                        </Button>
                      )}
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        /* Step 2 Fullscreen Split View Layout */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full">
          {/* Map Column (8 Cols) */}
          <div className="lg:col-span-8 flex flex-col space-y-3">
            <div className="flex items-center justify-between bg-slate-900 text-white p-3.5 rounded-2xl px-5">
              <div className="flex items-center gap-2 text-xs font-semibold">
                <MapPin className="h-4 w-4 text-rose-400 animate-bounce" />
                <span>Klik lokasi di peta di bawah untuk menentukan titik tujuan ambulans</span>
              </div>
              <Button size="sm" variant="ghost" onClick={() => setStep(1)} className="text-xs text-slate-300 hover:text-white hover:bg-white/10 h-7 rounded-lg">
                <ArrowLeft className="mr-1 h-3.5 w-3.5" /> Ganti Armada
              </Button>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-md h-[580px]">
              <MapComponent 
                hospitalCoords={hospitalCoords} 
                onRouteCalculated={handleRouteCalculated} 
              />
            </div>
          </div>

          {/* Right Summary Column (4 Cols) */}
          <div className="lg:col-span-4 space-y-4">
            <Card className="rounded-2xl border-slate-200 bg-white shadow-md">
              <CardHeader className="pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2 text-xs font-bold text-sky-600 uppercase tracking-wider">
                  <Sparkles className="h-4 w-4" />
                  <span>Kalkulator Rute & Disposisi</span>
                </div>
                <CardTitle className="text-lg font-extrabold text-slate-900">Ringkasan Pesanan</CardTitle>
                <CardDescription className="text-xs">Armada terpilih & rincian biaya rute.</CardDescription>
              </CardHeader>
              <CardContent className="p-4 space-y-4">
                {/* Selected Car Info Card */}
                {selectedCar && (
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-lg bg-sky-600 text-white flex items-center justify-center font-bold">
                        <Truck className="h-4 w-4" />
                      </div>
                      <div>
                        <span className="font-extrabold text-slate-900 text-sm block">{selectedCar.name}</span>
                        <span className="text-[11px] font-mono font-semibold text-slate-500">{selectedCar.plate_number}</span>
                      </div>
                    </div>
                    <Badge variant="outline" className="bg-white text-slate-700 text-[11px]">Selected</Badge>
                  </div>
                )}

                {distanceKm !== null && selectedCar ? (
                  <div className="space-y-3 pt-2">
                    <div className="flex justify-between items-center text-xs pb-2 border-b border-slate-100">
                      <span className="text-slate-500 font-medium">Jarak Tempuh Peta:</span>
                      <span className="font-bold text-slate-900 text-sm">{distanceKm.toFixed(2)} km</span>
                    </div>

                    <div className="flex justify-between items-center text-xs pb-2 border-b border-slate-100">
                      <span className="text-slate-500 font-medium">Tarif Unit ({selectedCar.name}):</span>
                      <span className="font-bold text-slate-900">
                        Rp {new Intl.NumberFormat('id-ID').format(selectedCar.base_price_per_km)} / km
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-xs pb-2 border-b border-slate-100">
                      <span className="text-slate-500 font-medium">Hitungan Perjalanan:</span>
                      <Badge variant="outline" className="bg-sky-50 text-sky-700 border-sky-200 font-bold text-[11px]">
                        Pulang-Pergi (2x Jarak)
                      </Badge>
                    </div>

                    <div className="p-4 rounded-xl bg-sky-50/60 border border-sky-200/80 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-sky-800 uppercase tracking-wider block">Total Tagihan Estimasi</span>
                        <span className="text-[10px] font-bold text-sky-600">2x {distanceKm.toFixed(2)} km</span>
                      </div>
                      <span className="text-2xl font-black text-sky-600 block">
                        Rp {new Intl.NumberFormat('id-ID').format(Number(distanceKm.toFixed(2)) * selectedCar.base_price_per_km * 2)}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="p-6 rounded-xl border border-dashed border-slate-300 text-center space-y-2">
                    <MapPin className="h-6 w-6 text-slate-400 mx-auto" />
                    <p className="text-xs text-slate-500">Klik titik lokasi pada peta sebelah kiri untuk menghitung rute & biaya.</p>
                  </div>
                )}
              </CardContent>

              <CardFooter className="p-4 pt-0">
                <Button 
                  disabled={distanceKm === null || isPending}
                  onClick={handleCheckout} 
                  className="w-full h-11 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-sm shadow-md shadow-sky-600/20"
                >
                  {isPending ? (
                    <span className="flex items-center gap-2">
                      <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Memproses...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <span>Konfirmasi & Disposisi</span>
                      <ArrowRight className="h-4 w-4" />
                    </span>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
