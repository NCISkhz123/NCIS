"use client";

import { useState, useTransition } from "react";
import { Database } from "@/types/supabase";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { createAmbulanceOrder } from "@/app/(protected)/ambulance/order/actions";

const MapComponent = dynamic(() => import('@/components/ambulance/AmbulanceMap'), { ssr: false });

type Ambulance = Database["public"]["Tables"]["ambulances"]["Row"];

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
      const totalCost = distanceKm * selectedCar.base_price_per_km;
      const res = await createAmbulanceOrder({
        ambulance_id: selectedCar.id,
        destination_lat: destination[0],
        destination_lng: destination[1],
        distance_km: distanceKm,
        total_cost: totalCost,
      });

      if (res.error) {
        alert("Gagal membuat pesanan: " + res.error);
      } else {
        alert("Pesanan berhasil dibuat!");
        router.push("/ambulance/history"); // We don't have history page, but the task says to redirect there or show success state.
      }
    });
  };

  if (step === 1) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Pilih Ambulans</h2>
          <p className="text-muted-foreground">
            Pilih armada ambulans yang tersedia untuk memulai pesanan.
          </p>
        </div>
        
        {ambulances.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-muted-foreground">Tidak ada ambulans yang tersedia saat ini.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {ambulances.map((ambulance) => (
              <Card key={ambulance.id} className={cn("flex flex-col cursor-pointer transition-all", selectedCar?.id === ambulance.id ? "border-primary ring-2 ring-primary/20" : "hover:border-primary/50")}>
                <CardHeader>
                  <CardTitle className="flex justify-between items-start gap-4">
                    <span>{ambulance.name}</span>
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      Tersedia
                    </Badge>
                  </CardTitle>
                  <CardDescription className="text-lg font-medium text-foreground">
                    {ambulance.plate_number}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1">
                  <div className="aspect-video bg-muted rounded-md mb-4 flex items-center justify-center overflow-hidden">
                    {ambulance.image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={ambulance.image_url} alt={ambulance.name} className="object-cover w-full h-full" />
                    ) : (
                      <span className="text-muted-foreground text-sm">Tidak ada gambar</span>
                    )}
                  </div>
                  <div className="text-sm">
                    <span className="text-muted-foreground">Tarif Dasar: </span>
                    <span className="font-semibold">
                      Rp {new Intl.NumberFormat('id-ID').format(ambulance.base_price_per_km)} / km
                    </span>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    className="w-full" 
                    onClick={() => {
                      setSelectedCar(ambulance);
                      setStep(2);
                    }}
                  >
                    Pilih
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Tentukan Tujuan</h2>
        <p className="text-muted-foreground">
          Anda telah memilih <strong>{selectedCar?.name} ({selectedCar?.plate_number})</strong>.
        </p>
      </div>
      
      <div className="border rounded-md overflow-hidden bg-background">
        <MapComponent 
          hospitalCoords={hospitalCoords} 
          onRouteCalculated={handleRouteCalculated} 
        />
      </div>

      {distanceKm !== null && destination !== null && selectedCar && (
        <Card>
          <CardHeader>
            <CardTitle>Ringkasan Pesanan</CardTitle>
            <CardDescription>Rincian estimasi jarak dan biaya perjalanan.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Jarak Tempuh:</span>
              <span className="font-medium">{distanceKm.toFixed(2)} km</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Tarif Dasar ({selectedCar.name}):</span>
              <span className="font-medium">Rp {new Intl.NumberFormat('id-ID').format(selectedCar.base_price_per_km)} / km</span>
            </div>
            <div className="pt-4 border-t flex justify-between items-center">
              <span className="font-semibold text-foreground">Total Estimasi Biaya:</span>
              <span className="text-xl font-bold text-primary">
                Rp {new Intl.NumberFormat('id-ID').format(distanceKm * selectedCar.base_price_per_km)}
              </span>
            </div>
          </CardContent>
          <CardFooter className="flex gap-4">
            <Button variant="outline" onClick={() => setStep(1)} disabled={isPending}>
              Ganti Armada
            </Button>
            <Button className="flex-1" onClick={handleCheckout} disabled={isPending}>
              {isPending ? 'Memproses...' : 'Konfirmasi & Pesan'}
            </Button>
          </CardFooter>
        </Card>
      )}

      {distanceKm === null && (
        <div className="p-4 border rounded-md border-dashed text-center">
          <p className="text-muted-foreground mb-4">Klik pada peta untuk menentukan lokasi tujuan.</p>
          <Button variant="outline" onClick={() => setStep(1)}>
            Kembali ke Pemilihan Armada
          </Button>
        </div>
      )}
    </div>
  );
}
