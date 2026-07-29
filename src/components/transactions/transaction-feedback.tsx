import { FeedbackBanner } from "@/components/feedback/feedback-banner";

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

function buildImpactMessage(impact: TransactionImpact) {
  return `Jumlah ${impact.quantity}${
    impact.fromLabel ? ` dari ${impact.fromLabel}` : ""
  }${impact.toLabel ? ` ke ${impact.toLabel}` : ""}. ${
    impact.resultingBalanceLabel
  } sekarang ${impact.resultingBalance}.`;
}

export function TransactionFeedback({
  error,
  message,
  impact,
}: TransactionFeedbackProps) {
  if (error) {
    return (
      <FeedbackBanner tone="error" label="Perlu dicek">
        {error}
      </FeedbackBanner>
    );
  }

  if (!message && !impact) {
    return null;
  }

  return (
    <div className="grid gap-3">
      {message ? (
        <FeedbackBanner tone="success" label="Transaksi tersimpan">
          {message}
        </FeedbackBanner>
      ) : null}
      {impact ? (
        <FeedbackBanner tone="info" label={impact.movementLabel}>
          {buildImpactMessage(impact)}
        </FeedbackBanner>
      ) : null}
    </div>
  );
}
