import { FeedbackBanner } from "@/components/feedback/feedback-banner";
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
    <FeedbackBanner tone="success" label="Perubahan tersimpan">
      {message}
    </FeedbackBanner>
  );
}
