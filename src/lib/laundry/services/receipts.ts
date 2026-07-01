import { receiptSchema } from "@/lib/cssd/validators/receipt";
import {
  executeStockRpc,
  formatDateForRpc,
  type LaundryRpcClient,
} from "@/lib/laundry/services/stock";

export async function receiveStock(client: LaundryRpcClient, input: unknown) {
  const parsed = receiptSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false as const,
      error: parsed.error.issues[0]?.message ?? "Payload receipt tidak valid",
      issues: parsed.error.issues.map((issue) => issue.message),
    };
  }

  return executeStockRpc(client, "laundry_receive_stock", {
    p_item_id: parsed.data.itemId,
    p_quantity: parsed.data.quantity,
    p_occurred_at: formatDateForRpc(parsed.data.transactionDate),
    p_notes: parsed.data.notes ?? null,
  });
}

