import { reusableTransferSchema } from "@/lib/cssd/validators/reusable-transfer";
import {
  executeStockRpc,
  formatDateForRpc,
  type CssdRpcClient,
} from "@/lib/cssd/services/stock";

export async function transferReusableStock(
  client: CssdRpcClient,
  input: unknown
) {
  const parsed = reusableTransferSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false as const,
      error: parsed.error.issues[0]?.message ?? "Payload perpindahan reusable tidak valid",
      issues: parsed.error.issues.map((issue) => issue.message),
    };
  }

  return executeStockRpc(client, "cssd_transfer_reusable_stock", {
    p_item_id: parsed.data.itemId,
    p_quantity: parsed.data.quantity,
    p_from_position: parsed.data.fromPosition,
    p_to_position: parsed.data.toPosition,
    p_occurred_at: formatDateForRpc(parsed.data.transactionDate),
    p_notes: parsed.data.notes ?? null,
  });
}
