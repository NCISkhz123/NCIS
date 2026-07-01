type TransactionImpact = {
  movementLabel: string;
  quantity: number;
  fromLabel?: string | null;
  toLabel?: string | null;
  resultingBalance: number;
  resultingBalanceLabel: string;
};

type TransactionFeedbackProps = {
  error?: string | null;
  message?: string | null;
  impact?: TransactionImpact | null;
};

export function TransactionFeedback({
  error,
  message,
  impact,
}: TransactionFeedbackProps) {
  if (error) {
    return (
      <p className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
        {error}
      </p>
    );
  }

  if (!message && !impact) {
    return null;
  }

  return (
    <div className="grid gap-3">
      {message ? (
        <p className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {message}
        </p>
      ) : null}
      {impact ? (
        <div className="rounded-[1.35rem] border border-sky-200 bg-sky-50 px-4 py-4 text-sm text-sky-900">
          <p className="font-semibold">{impact.movementLabel}</p>
          <p className="mt-2 leading-6">
            Qty {impact.quantity}
            {impact.fromLabel ? ` dari ${impact.fromLabel}` : ""}
            {impact.toLabel ? ` ke ${impact.toLabel}` : ""}.{" "}
            {impact.resultingBalanceLabel}: {impact.resultingBalance}.
          </p>
        </div>
      ) : null}
    </div>
  );
}

