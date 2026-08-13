import Link from "next/link";
import { format } from "date-fns";
import { id } from "date-fns/locale";

import { listReturnTransactionSessions } from "@/lib/laundry/services/return-processing-read-models";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button, buttonVariants } from "@/components/ui/button";
import { Package, Search } from "lucide-react";

export default async function AreaPembersihanPage(
  props: {
    searchParams?: Promise<{
      startDate?: string;
      endDate?: string;
    }>;
  }
) {
  const searchParams = await props.searchParams;
  const startDate = searchParams?.startDate;
  const endDate = searchParams?.endDate;

  const supabase = await createServerSupabaseClient();
  const sessions = await listReturnTransactionSessions(supabase, {
    startDate,
    endDate,
  });

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          Area Pembersihan
        </h1>
        <p className="text-slate-500 mt-2">
          Daftar pengembalian reusable dari unit. Klik untuk memproses item ke area pencucian atau menandai bersih/rusak.
        </p>
      </div>

      <Card>
        <CardHeader className="bg-slate-50/50 border-b border-slate-100">
          <form className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <label htmlFor="startDate" className="text-sm font-medium text-slate-600">Dari:</label>
              <Input 
                id="startDate"
                name="startDate" 
                type="date" 
                defaultValue={startDate}
                className="w-40" 
              />
            </div>
            <div className="flex items-center gap-2">
              <label htmlFor="endDate" className="text-sm font-medium text-slate-600">Sampai:</label>
              <Input 
                id="endDate"
                name="endDate" 
                type="date" 
                defaultValue={endDate}
                className="w-40" 
              />
            </div>
            <Button type="submit" variant="secondary" size="sm">
              <Search className="w-4 h-4 mr-2" />
              Filter
            </Button>
            {(startDate || endDate) && (
              <Link href="/laundry/area-pembersihan" className={buttonVariants({ variant: "ghost", size: "sm" })}>
                Reset
              </Link>
            )}
          </form>
        </CardHeader>
        <CardContent className="p-0">
          {sessions.length === 0 ? (
            <div className="p-8 text-center text-slate-500">
              Tidak ada riwayat pengembalian pada rentang waktu ini.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {sessions.map((session) => (
                <Link 
                  key={session.id} 
                  href={`/laundry/area-pembersihan/${session.id}`}
                  className="block hover:bg-sky-50/50 transition-colors p-4 sm:p-6"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="hidden sm:flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-sky-100 text-sky-600">
                        <Package className="h-6 w-6" />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg text-slate-900">
                          {session.sourceUnitName}
                        </h3>
                        <p className="text-sm text-slate-500 flex items-center gap-2 mt-1">
                          <span>
                            {format(new Date(session.transactionDate), "dd MMMM yyyy", { locale: id })}
                          </span>
                          <span>•</span>
                          <span>Oleh: {session.actorName}</span>
                        </p>
                        {session.notes && (
                          <p className="text-sm text-slate-600 mt-2 bg-slate-50 px-3 py-1.5 rounded-md inline-block">
                            "{session.notes}"
                          </p>
                        )}
                      </div>
                    </div>
                    <div>
                      {session.status === "MENUNGGU" && (
                        <Badge variant="secondary" className="bg-slate-100 text-slate-600">
                          Menunggu Proses
                        </Badge>
                      )}
                      {session.status === "PROSES" && (
                        <Badge variant="warning" className="bg-amber-100 text-amber-700 hover:bg-amber-100">
                          Sedang Diproses
                        </Badge>
                      )}
                      {session.status === "SELESAI" && (
                        <Badge variant="default" className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
                          Selesai Semua
                        </Badge>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
