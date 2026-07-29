import { FeedbackBanner } from "@/components/feedback/feedback-banner";

type FormErrorProps = {
  message?: string | null;
};

export function FormError({ message }: FormErrorProps) {
  if (!message) {
    return null;
  }

  return (
    <FeedbackBanner tone="error" label="Perlu dicek">
      {message}
    </FeedbackBanner>
  );
}
