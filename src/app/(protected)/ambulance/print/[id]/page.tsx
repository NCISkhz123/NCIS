import { Metadata } from "next";
import { notFound } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { AmbulanceReceiptPrintView, type PrintReceiptDetail } from "@/components/ambulance/print/ambulance-receipt-print-view";

export const metadata: Metadata = {
  title: "Cetak Nota Disposisi Ambulans | NCIS",
  description: "Cetak dan unduh PDF nota disposisi transaksi ambulans.",
};

const DEFAULT_HOSPITAL_COORDS: [number, number] = [-6.200000, 106.816666];

export default async function AmbulancePrintReceiptPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createServerSupabaseClient();

  const { data: transaction, error } = await supabase
    .from("ambulance_transactions")
    .select(`
      *,
      ambulances (
        name,
        plate_number,
        base_price_per_km,
        image_url
      )
    `)
    .eq("id", id)
    .single();

  if (error || !transaction) {
    notFound();
  }

  const { data: settings } = await supabase
    .from("ambulance_settings")
    .select("*")
    .limit(1)
    .maybeSingle();

  const hospitalCoords: [number, number] = settings 
    ? [settings.hospital_lat, settings.hospital_lng]
    : DEFAULT_HOSPITAL_COORDS;

  return (
    <AmbulanceReceiptPrintView 
      transaction={transaction as unknown as PrintReceiptDetail} 
      hospitalCoords={hospitalCoords} 
    />
  );
}
