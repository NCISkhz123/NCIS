import { FormError } from "@/components/forms/form-error";

type MasterDataFeedbackProps = {
  error?: string | null;
  message?: string | null;
};

export function MasterDataFeedback({
  error,
  message,
}: MasterDataFeedbackProps) {
  if (error) {
    return <FormError message={error} />;
  }

  if (!message) {
    return null;
  }

  return (
    <p className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
      {message}
    </p>
  );
}
