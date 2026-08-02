"use client";

import { useEffect, useState } from "react";
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

export function TransactionFeedback({
  error,
  message,
  impact,
}: TransactionFeedbackProps) {
  const [visible, setVisible] = useState(true);
  const [fadingOut, setFadingOut] = useState(false);

  useEffect(() => {
    setVisible(true);
    setFadingOut(false);

    if (!error && message) {
      const fadeTimer = setTimeout(() => {
        setFadingOut(true);
      }, 4000);

      const hideTimer = setTimeout(() => {
        setVisible(false);
      }, 5000);

      return () => {
        clearTimeout(fadeTimer);
        clearTimeout(hideTimer);
      };
    }
  }, [error, message, impact]);

  if (!visible) {
    return null;
  }

  if (error) {
    return (
      <FeedbackBanner tone="error" label="Perlu dicek">
        {error}
      </FeedbackBanner>
    );
  }

  if (!message) {
    return null;
  }

  return (
    <div
      className={`grid gap-3 transition-opacity duration-1000 ease-in-out ${
        fadingOut ? "opacity-0" : "opacity-100"
      }`}
    >
      <FeedbackBanner tone="success" label="Transaksi tersimpan">
        {message}
      </FeedbackBanner>
    </div>
  );
}
