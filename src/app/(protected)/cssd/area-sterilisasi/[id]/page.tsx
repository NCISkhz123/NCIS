import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";

import { getReturnTransactionSessionDetail } from "@/lib/cssd/services/return-processing-read-models";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { ReturnProcessingBoard } from "./return-processing-board";

export default async function AreaSterilisasiDetailPage(
  props: {
    params: Promise<{ id: string }>;
  }
) {
  const params = await props.params;
  const id = params.id;

  const supabase = await createServerSupabaseClient();
  const session = await getReturnTransactionSessionDetail(supabase, id);

  if (!session) {
    notFound();
  }

  return (
    <div className="container mx-auto py-8 max-w-5xl space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild className="rounded-full">
          <Link href="/cssd/area-sterilisasi">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Proses Pengembalian
          </h1>
          <p className="text-slate-500 mt-1">
            Transaksi dari <span className="font-semibold text-slate-800">{session.sourceUnitName}</span> pada {format(new Date(session.transactionDate), "dd MMMM yyyy", { locale: localeId })}
          </p>
        </div>
      </div>

      <ReturnProcessingBoard session={session} />
    </div>
  );
}
