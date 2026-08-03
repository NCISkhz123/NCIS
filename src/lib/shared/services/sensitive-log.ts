import type { SupabaseClient } from "@supabase/supabase-js";

export type DeletedTransactionLog = {
  id: string;
  moduleName: string;
  transactionType: string;
  originalId: string;
  originalData: any;
  deletedBy: string;
  deletedAt: string;
  reason: string | null;
  deletedByName?: string;
};

export async function listDeletedTransactionLogs(
  supabase: SupabaseClient,
  moduleName?: string
): Promise<DeletedTransactionLog[]> {
  let query = supabase
    .from("deleted_transaction_logs")
    .select("id, module_name, transaction_type, original_id, original_data, deleted_by, deleted_at, reason")
    .order("deleted_at", { ascending: false });

  if (moduleName) {
    query = query.eq("module_name", moduleName);
  }

  const { data, error } = await query.limit(100);

  if (error || !data) {
    return [];
  }

  // Fetch profiles for the users
  const userIds = Array.from(new Set(data.map((row) => row.deleted_by)));
  const { data: profiles } = await supabase
    .from("profiles")
    .select("user_id, full_name")
    .in("user_id", userIds);

  const profileMap = new Map(
    profiles?.map((p) => [p.user_id, p.full_name]) ?? []
  );

  return data.map((row) => ({
    id: row.id,
    moduleName: row.module_name,
    transactionType: row.transaction_type,
    originalId: row.original_id,
    originalData: row.original_data,
    deletedBy: row.deleted_by,
    deletedAt: row.deleted_at,
    reason: row.reason,
    deletedByName: profileMap.get(row.deleted_by) ?? "Unknown User",
  }));
}
