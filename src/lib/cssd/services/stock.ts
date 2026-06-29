import type { z } from "zod";

export type CssdRpcClient = {
  rpc<T>(
    functionName: string,
    args: Record<string, unknown>
  ): Promise<{
    data: T | null;
    error: { message: string } | null;
  }>;
};

export type StockMutationResultData = {
  transaction_id: string | null;
  movement_id: string;
  item_id: string;
  item_type: string;
  quantity: number;
  from_position: string | null;
  to_position: string | null;
  hospital_unit_id: string | null;
  resulting_balance: number;
};

export type ServiceResult<T> =
  | {
      success: true;
      data: T;
    }
  | {
      success: false;
      error: string;
      issues?: string[];
    };

export function formatDateForRpc(date: Date) {
  return date.toISOString().slice(0, 10);
}

export function validationFailure(
  issues: z.ZodIssue[] | readonly { message: string }[]
): ServiceResult<never> {
  const messages = issues.map((issue) => issue.message);

  return {
    success: false,
    error: messages[0] ?? "Validation failed",
    issues: messages,
  };
}

export async function executeStockRpc(
  client: CssdRpcClient,
  functionName: string,
  args: Record<string, unknown>
): Promise<ServiceResult<StockMutationResultData>> {
  const { data, error } = await client.rpc<StockMutationResultData>(functionName, args);

  if (error || !data) {
    return {
      success: false,
      error: error?.message ?? "Unknown stock mutation error",
    };
  }

  return {
    success: true,
    data,
  };
}
