"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Database } from "@/types/supabase";

type Ambulance = Database["public"]["Tables"]["ambulances"]["Row"];
type AmbulanceSetting = Database["public"]["Tables"]["ambulance_settings"]["Row"];

interface Props {
  initialAmbulances: Ambulance[];
  initialSettings: AmbulanceSetting | null;
}

export function AmbulanceMasterView({ initialAmbulances, initialSettings }: Props) {
  const [ambulances, setAmbulances] = useState<Ambulance[]>(initialAmbulances);
  const [settings, setSettings] = useState<AmbulanceSetting | null>(initialSettings);
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Master Data Ambulance</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-800">Daftar Ambulance</h2>
            <Button size="sm">Tambah Ambulance</Button>
          </div>
          
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama</TableHead>
                <TableHead>Plat Nomor</TableHead>
                <TableHead>Tarif Dasar / KM</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ambulances.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-slate-500 py-8">
                    Belum ada data ambulance.
                  </TableCell>
                </TableRow>
              ) : (
                ambulances.map((amb) => (
                  <TableRow key={amb.id}>
                    <TableCell className="font-medium">{amb.name}</TableCell>
                    <TableCell>{amb.plate_number}</TableCell>
                    <TableCell>Rp {amb.base_price_per_km.toLocaleString()}</TableCell>
                    <TableCell>
                      {amb.is_active ? (
                        <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700 ring-1 ring-emerald-600/20 ring-inset">
                          Aktif
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-full bg-slate-50 px-2 py-1 text-xs font-medium text-slate-600 ring-1 ring-slate-500/10 ring-inset">
                          Non-aktif
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">Edit</Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs h-fit">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Pengaturan Rumah Sakit (Pusat)</h2>
          <form className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="hospital_lat" className="text-sm font-medium text-slate-700">Latitude Rumah Sakit</label>
              <Input
                id="hospital_lat"
                name="hospital_lat"
                type="number"
                step="any"
                defaultValue={settings?.hospital_lat ?? ""}
                placeholder="-6.200000"
                required
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="hospital_lng" className="text-sm font-medium text-slate-700">Longitude Rumah Sakit</label>
              <Input
                id="hospital_lng"
                name="hospital_lng"
                type="number"
                step="any"
                defaultValue={settings?.hospital_lng ?? ""}
                placeholder="106.816666"
                required
              />
            </div>
            <div className="pt-2">
              <Button type="submit" className="w-full">Simpan Pengaturan</Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
