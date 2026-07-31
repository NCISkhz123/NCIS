"use client";

import { useState } from "react";
import { Database } from "@/types/supabase";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type Ambulance = Database["public"]["Tables"]["ambulances"]["Row"];

export function OrderWizard({ ambulances }: { ambulances: Ambulance[] }) {
  const [step, setStep] = useState<1 | 2>(1);
  const [selectedCar, setSelectedCar] = useState<Ambulance | null>(null);

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
              <Card key={ambulance.id} className={`flex flex-col ${selectedCar?.id === ambulance.id ? 'border-primary ring-2 ring-primary/20' : ''}`}>
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
      
      <div className="p-10 border rounded-md border-dashed text-center">
        <p className="text-muted-foreground mb-4">Langkah 2: Pemilihan Peta Tujuan (Segera hadir)</p>
        <Button variant="outline" onClick={() => setStep(1)}>
          Kembali ke Pemilihan Armada
        </Button>
      </div>
    </div>
  );
}
