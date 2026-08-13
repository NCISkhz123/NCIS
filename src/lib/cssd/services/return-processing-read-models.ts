import type { SupabaseClient } from "@supabase/supabase-js";

export type ReturnTransactionSessionEntry = {
  id: string;
  referenceNo: string | null;
  transactionDate: string;
  sourceUnitId: string;
  sourceUnitName: string;
  notes: string | null;
  actorName: string;
  status: "MENUNGGU" | "PROSES" | "SELESAI";
};

export type ReturnTransactionLineEntry = {
  id: string;
  itemId: string;
  itemName: string;
  itemCode: string;
  quantity: number;
  processedToSterilizationQty: number;
  processedToReadyQty: number;
  damagedNonSterileQty: number;
  damagedSterilizationQty: number;
  availableNonSterile: number;
  availableSterilizationArea: number;
};

export type ReturnTransactionSessionDetail = ReturnTransactionSessionEntry & {
  lines: ReturnTransactionLineEntry[];
};

export async function listReturnTransactionSessions(
  supabase: SupabaseClient,
  options?: {
    startDate?: string;
    endDate?: string;
  }
): Promise<ReturnTransactionSessionEntry[]> {
  let query = supabase
    .from("return_transactions")
    .select(
      "id, reference_no, returned_at, notes, hospital_units(id, name), profiles(full_name), return_transaction_lines(quantity, processed_to_sterilization_qty, processed_to_ready_qty, damaged_non_sterile_qty, damaged_sterilization_qty)"
    )
    .order("returned_at", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(100);

  if (options?.startDate) {
    query = query.gte("returned_at", options.startDate);
  }
  if (options?.endDate) {
    query = query.lte("returned_at", options.endDate);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Failed to fetch return transaction sessions:", error);
    return [];
  }

  if (!data) {
    return [];
  }

  // Determine status based on lines
  return data.map((row: any) => {
    const unit = Array.isArray(row.hospital_units)
      ? row.hospital_units[0]
      : row.hospital_units;
    
    const profile = Array.isArray(row.profiles)
      ? row.profiles[0]
      : row.profiles;

    const lines = row.return_transaction_lines || [];
    let totalQuantity = 0;
    let totalFinished = 0;
    let hasAnyProgress = false;

    for (const line of lines) {
      totalQuantity += line.quantity;
      const finished = line.processed_to_ready_qty + line.damaged_non_sterile_qty + line.damaged_sterilization_qty;
      totalFinished += finished;
      if (line.processed_to_ready_qty > 0 || line.damaged_non_sterile_qty > 0 || line.damaged_sterilization_qty > 0 || line.processed_to_sterilization_qty > 0) {
        hasAnyProgress = true;
      }
    }

    let status: ReturnTransactionSessionEntry["status"] = "MENUNGGU";
    if (totalQuantity > 0 && totalFinished >= totalQuantity) {
      status = "SELESAI";
    } else if (hasAnyProgress) {
      status = "PROSES";
    }

    return {
      id: row.id,
      referenceNo: row.reference_no,
      transactionDate: row.returned_at,
      sourceUnitId: unit?.id ?? "",
      sourceUnitName: unit?.name ?? "-",
      notes: row.notes,
      actorName: profile?.full_name ?? "-",
      status,
    };
  });
}

export async function getReturnTransactionSessionDetail(
  supabase: SupabaseClient,
  id: string
): Promise<ReturnTransactionSessionDetail | null> {
  const { data, error } = await supabase
    .from("return_transactions")
    .select(
      "id, reference_no, returned_at, notes, hospital_units(id, name), profiles(full_name), return_transaction_lines(id, item_id, quantity, processed_to_sterilization_qty, processed_to_ready_qty, damaged_non_sterile_qty, damaged_sterilization_qty, items(id, name, code))"
    )
    .eq("id", id)
    .single();

  if (error || !data) {
    if (error) console.error("Failed to fetch return transaction session details:", error);
    return null;
  }

  const row = data as any;

  const unit = Array.isArray(row.hospital_units)
    ? row.hospital_units[0]
    : row.hospital_units;
  
  const profile = Array.isArray(row.profiles)
    ? row.profiles[0]
    : row.profiles;

  const linesRaw = row.return_transaction_lines || [];
  let totalQuantity = 0;
  let totalFinished = 0;
  let hasAnyProgress = false;

  const lines: ReturnTransactionLineEntry[] = linesRaw.map((line: any) => {
    const item = Array.isArray(line.items) ? line.items[0] : line.items;

    totalQuantity += line.quantity;
    const finished = line.processed_to_ready_qty + line.damaged_non_sterile_qty + line.damaged_sterilization_qty;
    totalFinished += finished;
    if (line.processed_to_ready_qty > 0 || line.damaged_non_sterile_qty > 0 || line.damaged_sterilization_qty > 0 || line.processed_to_sterilization_qty > 0) {
      hasAnyProgress = true;
    }

    const availableNonSterile = line.quantity - line.processed_to_sterilization_qty - line.damaged_non_sterile_qty;
    const availableSterilizationArea = line.processed_to_sterilization_qty - line.processed_to_ready_qty - line.damaged_sterilization_qty;

    return {
      id: line.id,
      itemId: line.item_id,
      itemName: item?.name ?? "-",
      itemCode: item?.code ?? "-",
      quantity: line.quantity,
      processedToSterilizationQty: line.processed_to_sterilization_qty,
      processedToReadyQty: line.processed_to_ready_qty,
      damagedNonSterileQty: line.damaged_non_sterile_qty,
      damagedSterilizationQty: line.damaged_sterilization_qty,
      availableNonSterile,
      availableSterilizationArea,
    };
  });

  let status: ReturnTransactionSessionEntry["status"] = "MENUNGGU";
  if (totalQuantity > 0 && totalFinished >= totalQuantity) {
    status = "SELESAI";
  } else if (hasAnyProgress) {
    status = "PROSES";
  }

  return {
    id: row.id,
    referenceNo: row.reference_no,
    transactionDate: row.returned_at,
    sourceUnitId: unit?.id ?? "",
    sourceUnitName: unit?.name ?? "-",
    notes: row.notes,
    actorName: profile?.full_name ?? "-",
    status,
    lines,
  };
}
