"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Database } from "@/types/supabase";
import dynamic from "next/dynamic";
import { toast } from "sonner";
import { saveAmbulanceSettings, saveAmbulance } from "./actions";

const MapPicker = dynamic(() => import("./hospital-map-picker-inner"), { 
  ssr: false, 
  loading: () => <div className="h-[400px] bg-slate-100 animate-pulse rounded-xl" /> 
});

type Ambulance = Database["public"]["Tables"]["ambulances"]["Row"];
type AmbulanceSetting = Database["public"]["Tables"]["ambulance_settings"]["Row"];

interface Props {
  initialAmbulances: Ambulance[];
  initialSettings: AmbulanceSetting | null;
}

const settingsSchema = z.object({
  hospital_lat: z.coerce.number().min(-90).max(90),
  hospital_lng: z.coerce.number().min(-180).max(180),
});

const ambulanceSchema = z.object({
  name: z.string().min(1, "Nama wajib diisi"),
  plate_number: z.string().min(1, "Plat nomor wajib diisi"),
  base_price_per_km: z.coerce.number().min(0, "Tarif tidak valid"),
  is_active: z.boolean().default(true),
});

type SettingsFormValues = z.infer<typeof settingsSchema>;
type AmbulanceFormValues = z.infer<typeof ambulanceSchema>;

export function AmbulanceMasterView({ initialAmbulances, initialSettings }: Props) {
  const ambulances = initialAmbulances;
  
  const settingsForm = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      hospital_lat: initialSettings?.hospital_lat ?? 0,
      hospital_lng: initialSettings?.hospital_lng ?? 0,
    },
  });

  const [isPending, setIsPending] = useState(false);

  const onSettingsSubmit = async (data: SettingsFormValues) => {
    setIsPending(true);
    try {
      await saveAmbulanceSettings({
        id: initialSettings?.id,
        ...data
      });
      toast.success("Pengaturan berhasil disimpan");
    } catch (error: any) {
      toast.error("Gagal menyimpan pengaturan: " + error.message);
    } finally {
      setIsPending(false);
    }
  };

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAmbulance, setEditingAmbulance] = useState<Ambulance | null>(null);

  const ambulanceForm = useForm<AmbulanceFormValues>({
    resolver: zodResolver(ambulanceSchema),
    defaultValues: {
      name: "",
      plate_number: "",
      base_price_per_km: 0,
      is_active: true,
    },
  });

  const openAddDialog = () => {
    setEditingAmbulance(null);
    ambulanceForm.reset({ name: "", plate_number: "", base_price_per_km: 0, is_active: true });
    setIsDialogOpen(true);
  };

  const openEditDialog = (amb: Ambulance) => {
    setEditingAmbulance(amb);
    ambulanceForm.reset({
      name: amb.name,
      plate_number: amb.plate_number,
      base_price_per_km: amb.base_price_per_km,
      is_active: amb.is_active ?? true,
    });
    setIsDialogOpen(true);
  };

  const onAmbulanceSubmit = async (data: AmbulanceFormValues) => {
    setIsPending(true);
    try {
      await saveAmbulance(editingAmbulance ? { id: editingAmbulance.id, ...data } : data);
      setIsDialogOpen(false);
      toast.success("Ambulance berhasil disimpan");
    } catch (error: any) {
      toast.error("Gagal menyimpan ambulance: " + error.message);
    } finally {
      setIsPending(false);
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Master Data Ambulance</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-800">Daftar Ambulance</h2>
            <Button size="sm" onClick={openAddDialog}>Tambah Ambulance</Button>
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
                    <TableCell>Rp {amb.base_price_per_km.toLocaleString("id-ID")}</TableCell>
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
                      <Button variant="ghost" size="sm" onClick={() => openEditDialog(amb)}>Edit</Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs h-fit">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Pengaturan Rumah Sakit (Pusat)</h2>
          <Form {...settingsForm}>
            <form onSubmit={settingsForm.handleSubmit(onSettingsSubmit)} className="space-y-4">
              <FormField
                control={settingsForm.control}
                name="hospital_lat"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Latitude Rumah Sakit</FormLabel>
                    <FormControl>
                      <Input type="number" step="any" placeholder="-6.200000" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={settingsForm.control}
                name="hospital_lng"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Longitude Rumah Sakit</FormLabel>
                    <FormControl>
                      <Input type="number" step="any" placeholder="106.816666" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="pt-2">
                <p className="text-sm font-medium text-slate-700 mb-2">Pilih Lokasi di Peta</p>
                <MapPicker 
                  lat={settingsForm.watch("hospital_lat")} 
                  lng={settingsForm.watch("hospital_lng")} 
                  onChange={(lat, lng) => {
                    settingsForm.setValue("hospital_lat", lat, { shouldValidate: true, shouldDirty: true });
                    settingsForm.setValue("hospital_lng", lng, { shouldValidate: true, shouldDirty: true });
                  }} 
                />
              </div>

              <div className="pt-2">
                <Button type="submit" className="w-full" disabled={isPending}>
                  {isPending ? "Menyimpan..." : "Simpan Pengaturan"}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingAmbulance ? "Edit Ambulance" : "Tambah Ambulance"}</DialogTitle>
          </DialogHeader>
          <Form {...ambulanceForm}>
            <form onSubmit={ambulanceForm.handleSubmit(onAmbulanceSubmit)} className="space-y-4">
              <FormField
                control={ambulanceForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nama Ambulance</FormLabel>
                    <FormControl>
                      <Input placeholder="Ambulance A" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={ambulanceForm.control}
                name="plate_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Plat Nomor</FormLabel>
                    <FormControl>
                      <Input placeholder="B 1234 CD" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={ambulanceForm.control}
                name="base_price_per_km"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tarif Dasar / KM</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={ambulanceForm.control}
                name="is_active"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <input 
                        type="checkbox" 
                        className="h-4 w-4 rounded border-gray-300 text-slate-900 focus:ring-slate-900"
                        checked={field.value}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Ambulance Aktif</FormLabel>
                    </div>
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="button" variant="ghost" onClick={() => setIsDialogOpen(false)} disabled={isPending}>
                  Batal
                </Button>
                <Button type="submit" disabled={isPending}>
                  {isPending ? "Menyimpan..." : "Simpan"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
