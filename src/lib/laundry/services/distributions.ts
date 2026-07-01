import { distributionSchema } from "@/lib/cssd/validators/distribution";
import {
  executeStockRpc,
  formatDateForRpc,
  type LaundryRpcClient,
} from "@/lib/laundry/services/stock";

export async function distributeStock(client: LaundryRpcClient, input: unknown) {
  const parsed = distributionSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false as const,
      error: parsed.error.issues[0]?.message ?? "Payload distribusi tidak valid",
      issues: parsed.error.issues.map((issue) => issue.message),
    };
  }

  return executeStockRpc(client, "laundry_distribute_stock", {
    p_item_id: parsed.data.itemId,
    p_quantity: parsed.data.quantity,
    p_target_unit_id: parsed.data.targetUnitId,
    p_occurred_at: formatDateForRpc(parsed.data.transactionDate),
    p_notes: parsed.data.notes ?? null,
  });
}
