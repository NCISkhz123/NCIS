import { createServerSupabaseClient } from "@/lib/supabase/server";
import { listDeletedTransactionLogs } from "@/lib/shared/services/sensitive-log";
import { DataTable } from "@/components/data/data-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { redirect } from "next/navigation";

export default async function AmbulanceSensitiveLogPage() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  const role = user?.user_metadata?.role || user?.app_metadata?.role;
  
  if (role !== "KEPALA_SEKSI") {
    redirect("/(protected)/ambulance/order");
  }

  const logs = await listDeletedTransactionLogs(supabase, "AMBULANCE");

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Log Transaksi Sensitif</h1>
        <p className="text-muted-foreground">
          Riwayat penghapusan transaksi pada modul Ambulance. Hanya dapat diakses oleh Superadmin.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Riwayat Penghapusan</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            caption="Log Sensitif Ambulance"
            columns={["Waktu Hapus", "Dihapus Oleh", "Jenis Transaksi", "Alasan", "Data Asli"]}
            rows={
              logs.length > 0
                ? logs.map((log) => [
                    new Date(log.deletedAt).toLocaleString("id-ID"),
                    log.deletedByName || "-",
                    log.transactionType,
                    log.reason || "-",
                    <pre key={log.id} className="text-xs max-w-xs overflow-auto">
                      {JSON.stringify(log.originalData, null, 2)}
                    </pre>,
                  ])
                : [["Belum ada riwayat penghapusan transaksi", "-", "-", "-", "-"]]
            }
          />
        </CardContent>
      </Card>
    </div>
  );
}
