export type TransactionImpact = {
  movementLabel: string;
  quantity: number;
  fromLabel?: string | null;
  toLabel?: string | null;
  resultingBalance: number;
  resultingBalanceLabel: string;
};

export type ReceiptFormState = {
  error: string | null;
  message: string | null;
  impact: TransactionImpact | null;
  values?: {
    itemId?: string;
    itemType?: string;
    transactionDate?: string;
    quantity?: string;
    notes?: string;
  };
};

export const initialReceiptFormState: ReceiptFormState = {
  error: null,
  message: null,
  impact: null,
};

export type DistributionFormState = {
  error: string | null;
  message: string | null;
  impact: TransactionImpact | null;
  values?: {
    itemId?: string;
    itemType?: string;
    targetUnitId?: string;
    transactionDate?: string;
    quantity?: string;
    notes?: string;
  };
};

export const initialDistributionFormState: DistributionFormState = {
  error: null,
  message: null,
  impact: null,
};

export type InternalUsageFormState = {
  error: string | null;
  message: string | null;
  impact: TransactionImpact | null;
  values?: {
    itemId?: string;
    itemType?: string;
    transactionDate?: string;
    quantity?: string;
    notes?: string;
  };
};

export const initialInternalUsageFormState: InternalUsageFormState = {
  error: null,
  message: null,
  impact: null,
};

export type ReturnFormState = {
  error: string | null;
  message: string | null;
  impact: TransactionImpact | null;
  values?: {
    itemId?: string;
    sourceUnitId?: string;
    destinationPosition?: string;
    transactionDate?: string;
    quantity?: string;
    notes?: string;
  };
};

export type ReusableProcessingFormState = {
  error: string | null;
  message: string | null;
  impact: TransactionImpact | null;
};

export const initialReturnFormState: ReturnFormState = {
  error: null,
  message: null,
  impact: null,
};

export const initialReusableProcessingFormState: ReusableProcessingFormState = {
  error: null,
  message: null,
  impact: null,
};

export type StockOpnameDraftFormValues = {
  opnameDate?: string;
  notes?: string;
  scopeType?: "GLOBAL" | "INTERNAL" | "UNIT";
  hospitalUnitId?: string;
};

export type StockOpnameDraftFormState = {
  error: string | null;
  message: string | null;
  values?: StockOpnameDraftFormValues;
};

type StockOpnameFeedbackState = {
  error: string | null;
  message: string | null;
  values?: Record<string, string>;
};

export type StockOpnameLineFormState = StockOpnameFeedbackState;
export type StockOpnameFinalizeFormState = StockOpnameFeedbackState;

export const initialStockOpnameDraftFormState: StockOpnameDraftFormState = {
  error: null,
  message: null,
};

export const initialStockOpnameLineFormState: StockOpnameLineFormState = {
  error: null,
  message: null,
};

export const initialStockOpnameFinalizeFormState: StockOpnameFinalizeFormState =
  {
    error: null,
    message: null,
  };
