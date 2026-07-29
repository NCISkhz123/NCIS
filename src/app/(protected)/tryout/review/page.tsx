import React from "react";
import { TryoutReviewView } from "@/components/tryout/tryout-review-view";
import { mockTryoutReviewData } from "@/data/mock-tryout-review";

export const metadata = {
  title: "Review Pembahasan Try Out | NCIS",
};

export default function TryoutReviewPage() {
  return <TryoutReviewView initialData={mockTryoutReviewData} />;
}
