import { internalUsageSchema } from "@/lib/cssd/validators/internal-usage";
import {
  executeStockRpc,
  formatDateForRpc,
  type CssdRpcClient,
} from "@/lib/cssd/services/stock";

export async function recordInternalUsage(
  client: CssdRpcClient,
  input: unknown
) {
  const parsed = internalUsageSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false as const,
      error: parsed.error.issues[0]?.message ?? "Payload pemakaian internal tidak valid",
      issues: parsed.error.issues.map((issue) => issue.message),
    };
  }

  return executeStockRpc(client, "cssd_record_internal_usage", {
    p_item_id: parsed.data.itemId,
    p_quantity: parsed.data.quantity,
    p_occurred_at: formatDateForRpc(parsed.data.transactionDate),
    p_notes: parsed.data.notes ?? null,
  });
}
