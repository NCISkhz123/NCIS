import { returnSchema } from "@/lib/cssd/validators/return";
import {
  executeStockRpc,
  formatDateForRpc,
  type CssdRpcClient,
} from "@/lib/cssd/services/stock";

export async function returnStock(client: CssdRpcClient, input: unknown) {
  const parsed = returnSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false as const,
      error: parsed.error.issues[0]?.message ?? "Payload pengembalian tidak valid",
      issues: parsed.error.issues.map((issue) => issue.message),
    };
  }

  return executeStockRpc(client, "cssd_return_stock", {
    p_item_id: parsed.data.itemId,
    p_quantity: parsed.data.quantity,
    p_source_unit_id: parsed.data.sourceUnitId,
    p_destination_position: parsed.data.destinationPosition,
    p_occurred_at: formatDateForRpc(parsed.data.transactionDate),
    p_notes: parsed.data.notes ?? null,
  });
}
