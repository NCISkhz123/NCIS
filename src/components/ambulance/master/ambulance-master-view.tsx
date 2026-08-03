"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Database } from "@/types/supabase";
import dynamic from "next/dynamic";
import { toast } from "sonner";
import { saveAmbulanceSettings, saveAmbulance } from "@/app/(protected)/ambulance/master/actions";
import { 
  Truck, 
  MapPin, 
  Plus, 
  Edit3, 
  CheckCircle2, 
  XCircle, 
  Building2, 
  Save,
  Upload,
  Image as ImageIcon,
  Loader2,
  Sparkles
} from "lucide-react";

const MapPicker = dynamic(() => import("./hospital-map-picker-inner"), { 
  ssr: false, 
  loading: () => (
    <div className="h-[350px] bg-slate-100 animate-pulse rounded-2xl flex flex-col items-center justify-center gap-2 border border-slate-200">
      <MapPin className="h-6 w-6 text-slate-400 animate-bounce" />
      <span className="text-xs text-slate-500 font-medium">Memuat peta lokasi...</span>
    </div>
  ) 
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
  image_url: z.string().nullable().optional(),
  is_active: z.boolean().default(true),
});

type SettingsFormValues = z.infer<typeof settingsSchema>;
type AmbulanceFormValues = z.infer<typeof ambulanceSchema>;

// Auto-compress image file to high quality WebP base64
function compressImageToWebp(file: File, maxWidth = 800, quality = 0.85): Promise<{ webpDataUrl: string; originalKb: number; compressedKb: number }> {
  return new Promise((resolve, reject) => {
    const originalKb = Math.round(file.size / 1024);
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) return reject(new Error("Gagal membuat canvas context"));

        ctx.drawImage(img, 0, 0, width, height);
        const webpDataUrl = canvas.toDataURL("image/webp", quality);
        const compressedKb = Math.round((webpDataUrl.length * 0.75) / 1024);

        resolve({ webpDataUrl, originalKb, compressedKb });
      };
      img.onerror = (err) => reject(err);
      img.src = event.target?.result as string;
    };
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}

export function AmbulanceMasterView({ initialAmbulances, initialSettings }: Props) {
  const ambulances = initialAmbulances;

  const settingsForm = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema) as any,
    defaultValues: {
      hospital_lat: initialSettings?.hospital_lat ?? 0,
      hospital_lng: initialSettings?.hospital_lng ?? 0,
    },
  });

  const [isPending, setIsPending] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false);
  const [compressionStats, setCompressionStats] = useState<{ originalKb: number; compressedKb: number } | null>(null);

  const onSettingsSubmit = async (data: SettingsFormValues) => {
    setIsPending(true);
    try {
      await saveAmbulanceSettings({
        id: initialSettings?.id,
        ...data
      });
      toast.success("Pengaturan lokasi rumah sakit berhasil disimpan!");
    } catch (error: any) {
      toast.error("Gagal menyimpan pengaturan: " + error.message);
    } finally {
      setIsPending(false);
    }
  };

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAmbulance, setEditingAmbulance] = useState<Ambulance | null>(null);

  const ambulanceForm = useForm<AmbulanceFormValues>({
    resolver: zodResolver(ambulanceSchema) as any,
    defaultValues: {
      name: "",
      plate_number: "",
      base_price_per_km: 0,
      image_url: null,
      is_active: true,
    },
  });

  const openAddDialog = () => {
    setEditingAmbulance(null);
    setCompressionStats(null);
    ambulanceForm.reset({ name: "", plate_number: "", base_price_per_km: 0, image_url: null, is_active: true });
    setIsDialogOpen(true);
  };

  const openEditDialog = (amb: Ambulance) => {
    setEditingAmbulance(amb);
    setCompressionStats(null);
    ambulanceForm.reset({
      name: amb.name,
      plate_number: amb.plate_number,
      base_price_per_km: amb.base_price_per_km,
      image_url: amb.image_url ?? null,
      is_active: amb.is_active ?? true,
    });
    setIsDialogOpen(true);
  };

  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Format file harus berupa gambar.");
      return;
    }

    setIsCompressing(true);
    try {
      const { webpDataUrl, originalKb, compressedKb } = await compressImageToWebp(file);
      ambulanceForm.setValue("image_url", webpDataUrl, { shouldDirty: true });
      setCompressionStats({ originalKb, compressedKb });
      toast.success(`Foto berhasil dikompresi ke WebP (${originalKb} KB → ${compressedKb} KB)`);
    } catch (err: any) {
      toast.error("Gagal memproses gambar: " + err.message);
    } finally {
      setIsCompressing(false);
    }
  };

  const onAmbulanceSubmit = async (data: AmbulanceFormValues) => {
    setIsPending(true);
    try {
      await saveAmbulance(editingAmbulance ? { id: editingAmbulance.id, ...data } : data);
      setIsDialogOpen(false);
      toast.success("Data armada ambulans berhasil disimpan!");
    } catch (error: any) {
      toast.error("Gagal menyimpan data armada: " + error.message);
    } finally {
      setIsPending(false);
    }
  };
  
  return (
    <div className="w-full space-y-6">
      <div className="grid gap-6 lg:grid-cols-12 w-full">
        {/* Table List Section (Col span 7) */}
        <div className="lg:col-span-7 rounded-2xl border border-slate-200 bg-white shadow-xs p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-extrabold text-slate-900">Daftar Armada Ambulans</h2>
              <p className="text-xs text-slate-500">Master unit ambulans yang terdaftar di sistem.</p>
            </div>
            <Button size="sm" onClick={openAddDialog} className="rounded-xl font-bold bg-sky-600 hover:bg-sky-700 text-white shadow-xs">
              <Plus className="mr-1.5 h-4 w-4" />
              Tambah Armada
            </Button>
          </div>
          
          <div className="rounded-xl border border-slate-200/80 overflow-hidden w-full">
            <Table>
              <TableHeader className="bg-slate-100/60">
                <TableRow className="border-b border-slate-200">
                  <TableHead className="font-bold text-slate-700 text-xs uppercase">Armada</TableHead>
                  <TableHead className="font-bold text-slate-700 text-xs uppercase">Nama / Plat</TableHead>
                  <TableHead className="font-bold text-slate-700 text-xs uppercase">Tarif Dasar</TableHead>
                  <TableHead className="font-bold text-slate-700 text-xs uppercase">Status</TableHead>
                  <TableHead className="text-right font-bold text-slate-700 text-xs uppercase">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ambulances.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-slate-500 py-10">
                      Belum ada data armada ambulans yang dibuat.
                    </TableCell>
                  </TableRow>
                ) : (
                  ambulances.map((amb) => (
                    <TableRow key={amb.id} className="hover:bg-slate-50/80 transition-colors">
                      <TableCell>
                        <div className="h-10 w-14 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center">
                          {amb.image_url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={amb.image_url} alt={amb.name} className="h-full w-full object-cover" />
                          ) : (
                            <Truck className="h-4 w-4 text-slate-400" />
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-extrabold text-slate-900 text-sm">{amb.name}</span>
                          <span className="text-[11px] font-mono font-semibold text-slate-500">{amb.plate_number}</span>
                        </div>
                      </TableCell>
                      <TableCell className="font-bold text-slate-900 text-xs">
                        Rp {amb.base_price_per_km.toLocaleString("id-ID")} <span className="text-slate-400 font-normal">/ km</span>
                      </TableCell>
                      <TableCell>
                        {amb.is_active ? (
                          <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 font-semibold">
                            Siaga (Aktif)
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-slate-100 text-slate-500 border-slate-200 font-medium">
                            Non-Aktif
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" onClick={() => openEditDialog(amb)} className="rounded-lg h-8 px-2 text-slate-600 hover:text-sky-600 hover:bg-sky-50">
                          <Edit3 className="h-3.5 w-3.5 mr-1" />
                          <span>Edit</span>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Hospital Headquarters Settings Form (Col span 5) */}
        <div className="lg:col-span-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4 h-fit">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-lg font-extrabold text-slate-900">Pangkalan Pusat Rumah Sakit</h2>
            <p className="text-xs text-slate-500">Titik acuan keberangkatan awal untuk hitungan rute.</p>
          </div>

          <Form {...settingsForm}>
            <form onSubmit={settingsForm.handleSubmit(onSettingsSubmit as any)} className="space-y-4">
              <div className="hidden">
                <FormField
                  control={settingsForm.control as any}
                  name="hospital_lat"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-bold text-slate-700">Latitude</FormLabel>
                      <FormControl>
                        <Input type="number" step="any" placeholder="-6.200000" className="rounded-xl h-10 border-slate-300 font-mono text-xs" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={settingsForm.control as any}
                  name="hospital_lng"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-bold text-slate-700">Longitude</FormLabel>
                      <FormControl>
                        <Input type="number" step="any" placeholder="106.816666" className="rounded-xl h-10 border-slate-300 font-mono text-xs" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700">Pilih Titik di Peta</span>
                  <span className="text-[11px] text-slate-400 font-mono">Klik lokasi pangkalan</span>
                </div>
                <div className="rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
                  <MapPicker 
                    lat={settingsForm.watch("hospital_lat")} 
                    lng={settingsForm.watch("hospital_lng")} 
                    onChange={(lat, lng) => {
                      settingsForm.setValue("hospital_lat", lat, { shouldValidate: true, shouldDirty: true });
                      settingsForm.setValue("hospital_lng", lng, { shouldValidate: true, shouldDirty: true });
                    }} 
                  />
                </div>
              </div>

              <Button type="submit" className="w-full h-10 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold tracking-wide shadow-xs" disabled={isPending}>
                <Save className="mr-2 h-4 w-4" />
                {isPending ? "Menyimpan..." : "Simpan Koordinat Pusat"}
              </Button>
            </form>
          </Form>
        </div>
      </div>

      {/* Add / Edit Dialog Modal */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl p-6 bg-white border border-slate-200 shadow-2xl z-50">
          <DialogHeader>
            <DialogTitle className="text-xl font-extrabold text-slate-900">
              {editingAmbulance ? "Edit Data Ambulans" : "Tambah Armada Ambulans Baru"}
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Lengkapi informasi unit armada & foto kendaraan untuk dimasukkan ke sistem.
            </DialogDescription>
          </DialogHeader>
          <Form {...ambulanceForm}>
            <form onSubmit={ambulanceForm.handleSubmit(onAmbulanceSubmit as any)} className="space-y-4 pt-2">
              <FormField
                control={ambulanceForm.control as any}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold text-slate-700">Nama Ambulans / Unit</FormLabel>
                    <FormControl>
                      <Input placeholder="Contoh: Ambulance Alpha (ICU)" className="rounded-xl h-10 border-slate-300 text-sm bg-white" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={ambulanceForm.control as any}
                name="plate_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold text-slate-700">Plat Nomor Kendaraan</FormLabel>
                    <FormControl>
                      <Input placeholder="Contoh: B 1234 CD" className="rounded-xl h-10 border-slate-300 text-sm font-mono bg-white" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={ambulanceForm.control as any}
                name="base_price_per_km"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold text-slate-700">Tarif Dasar / KM (IDR)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="50000" className="rounded-xl h-10 border-slate-300 text-sm bg-white" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Photo Upload Field with Auto WebP Compression */}
              <div className="space-y-2">
                <FormLabel className="text-xs font-bold text-slate-700 flex items-center justify-between">
                  <span>Foto Kendaraan Ambulans</span>
                  <span className="text-[10px] text-sky-600 font-semibold flex items-center gap-1">
                    <Sparkles className="h-3 w-3" /> Auto WebP Compression
                  </span>
                </FormLabel>

                <div className="rounded-xl border border-slate-200 p-3 bg-slate-50 space-y-3">
                  {ambulanceForm.watch("image_url") ? (
                    <div className="relative aspect-video w-full rounded-lg overflow-hidden border border-slate-200 group bg-slate-900">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img 
                        src={ambulanceForm.watch("image_url")!} 
                        alt="Preview" 
                        className="w-full h-full object-cover" 
                      />
                      <button
                        type="button"
                        onClick={() => {
                          ambulanceForm.setValue("image_url", null, { shouldDirty: true });
                          setCompressionStats(null);
                        }}
                        className="absolute top-2 right-2 rounded-full bg-slate-900/80 text-white p-1 text-xs hover:bg-rose-600 transition-colors"
                      >
                        <XCircle className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-slate-300 rounded-xl cursor-pointer hover:bg-slate-100/60 transition-colors">
                      {isCompressing ? (
                        <div className="flex flex-col items-center gap-2 text-sky-600">
                          <Loader2 className="h-6 w-6 animate-spin" />
                          <span className="text-xs font-medium">Mengompresi Gambar ke WebP...</span>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-1 text-slate-500">
                          <Upload className="h-6 w-6 text-slate-400" />
                          <span className="text-xs font-bold text-slate-800">Unggah Foto Kendaraan</span>
                          <span className="text-[11px] text-slate-400">PNG, JPG, WEBP (Otomatis Dioptimalkan)</span>
                        </div>
                      )}
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={handleImageFileChange} 
                        disabled={isCompressing || isPending}
                      />
                    </label>
                  )}

                  {compressionStats && (
                    <div className="flex items-center justify-between text-[11px] px-1 text-emerald-700 font-medium">
                      <span>✓ Kompresi WebP Berhasil</span>
                      <span>Ukuran: {compressionStats.originalKb} KB → <strong>{compressionStats.compressedKb} KB</strong></span>
                    </div>
                  )}
                </div>
              </div>

              <FormField
                control={ambulanceForm.control as any}
                name="is_active"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-xl border border-slate-200 p-4 bg-slate-50">
                    <div className="space-y-0.5">
                      <FormLabel className="text-sm font-bold text-slate-900">Status Operasional</FormLabel>
                      <p className="text-xs text-slate-500">Unit aktif & siap menerima panggilan emergency</p>
                    </div>
                    <FormControl>
                      <input 
                        type="checkbox" 
                        className="h-5 w-5 rounded border-slate-300 text-sky-600 focus:ring-sky-600 cursor-pointer"
                        checked={field.value}
                        onChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <DialogFooter className="gap-2 sm:gap-0 pt-2">
                <Button type="button" variant="ghost" onClick={() => setIsDialogOpen(false)} disabled={isPending || isCompressing} className="rounded-xl font-semibold">
                  Batal
                </Button>
                <Button type="submit" disabled={isPending || isCompressing} className="rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold shadow-xs">
                  {isPending ? "Menyimpan..." : "Simpan Armada"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
