import * as React from "react";
import { ShellSectionHeading } from "@/components/layout/shell-section-heading";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

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
  eyebrow,
  title,
  description,
  summary,
  formTitle,
  formDescription,
  form,
  supportingContent,
}: TransactionPageShellProps) {
  return (
    <div className="space-y-6">
      {eyebrow || title || description ? (
        <ShellSectionHeading
          eyebrow={eyebrow ?? ""}
          title={title ?? ""}
          description={description}
        />
      ) : null}
      {summary}
      <section className="grid gap-6 xl:grid-cols-12 items-start">
        {/* Left Column: Form Card (Sticky Desktop) */}
        <div className="xl:col-span-5">
          <Card className="sticky top-24 border-slate-200 shadow-sm">
            {formTitle || formDescription ? (
              <CardHeader className="pb-3">
                {formTitle ? (
                  <CardTitle className="text-base font-bold">
                    {formTitle}
                  </CardTitle>
                ) : null}
                {formDescription ? (
                  <CardDescription className="text-xs text-slate-600">
                    {formDescription}
                  </CardDescription>
                ) : null}
              </CardHeader>
            ) : null}
            <CardContent className="pt-6">{form}</CardContent>
          </Card>
        </div>

        {/* Right Column: Tables, History & Workflow */}
        <div className="xl:col-span-7 space-y-6">{supportingContent}</div>
      </section>
    </div>
  );
}
