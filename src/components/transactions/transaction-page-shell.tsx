import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";

type TransactionPageShellProps = {
  eyebrow?: string;
  title?: string;
  description?: string;
  summary?: React.ReactNode;
  formTitle?: string;
  formDescription?: string;
  form: React.ReactNode;
  supportingContent: React.ReactNode;
};

export function TransactionPageShell({
  formTitle,
  formDescription,
  form,
  supportingContent,
}: TransactionPageShellProps) {
  return (
    <section className="grid gap-6 xl:grid-cols-12 items-start">
      {/* Left Column: Form Card (Sticky Desktop) */}
      <div className="xl:col-span-5">
        <Card className="sticky top-24 border-slate-200 shadow-sm">
          <CardContent className="pt-6">{form}</CardContent>
        </Card>
      </div>

      {/* Right Column: Tables, History & Workflow */}
      <div className="xl:col-span-7 space-y-6">{supportingContent}</div>
    </section>
  );
}
