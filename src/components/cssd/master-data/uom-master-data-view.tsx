"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Edit2, Save, X } from "lucide-react";

import { saveUnitOfMeasureAction } from "@/app/(protected)/cssd/master-data/satuan/actions";
import { DataTable } from "@/components/data/data-table";
import { MasterDataFeedback } from "@/components/cssd/master-data/master-data-feedback";
import { StatusPill } from "@/components/cssd/master-data/status-pill";
import { ShellSectionHeading } from "@/components/layout/shell-section-heading";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  initialUnitOfMeasureFormState,
  type UnitOfMeasureFormState,
} from "@/lib/cssd/forms/master-data";
import type { UnitOfMeasureRow } from "@/lib/cssd/services/master-data";

type UomMasterDataViewProps = {
  initialState?: UnitOfMeasureFormState;
  records: UnitOfMeasureRow[];
  editingRecord: UnitOfMeasureRow | null;
};

export function UomMasterDataView({
  initialState = initialUnitOfMeasureFormState,
  records,
  editingRecord,
}: UomMasterDataViewProps) {
  const [formState, formAction, pending] = useActionState(
    saveUnitOfMeasureAction,
    initialState
  );

  const values = formState.values ?? {};

  return (
    <div className="grid gap-6">
      <section className="grid gap-6 xl:grid-cols-12 items-start">
        {/* Left Table */}
        <div className="xl:col-span-7 space-y-4">
          <Card>
            <CardContent className="pt-6">
              <DataTable
                caption="Daftar Satuan Terdaftar"
                columns={["Nama Satuan", "Kode Satuan", "Status", "Aksi"]}
                rows={records.map((record) => [
                  record.name,
                  <span key={`${record.id}-code`} className="font-mono text-xs font-bold text-slate-900">
                    {record.code}
                  </span>,
                  <StatusPill key={`${record.id}-status`} active={record.is_active} />,
                  <Link
                    key={`${record.id}-edit`}
                    href={`/cssd/master-data/satuan?edit=${record.id}`}
                    className="inline-flex items-center gap-1 text-xs font-bold text-sky-700 hover:text-sky-900"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                    <span>Edit</span>
                  </Link>,
                ])}
              />
            </CardContent>
          </Card>
        </div>

        {/* Right Form Card */}
        <div className="xl:col-span-5">
          <Card className="sticky top-24 border-slate-200 shadow-sm">
            <CardContent className="pt-6">
              <form action={formAction} className="grid gap-4">
                <input type="hidden" name="id" value={editingRecord?.id ?? ""} />

                <div className="grid gap-1.5">
                  <label
                    htmlFor="uom-code"
                    className="text-xs font-semibold uppercase tracking-wider text-slate-800"
                  >
                    Kode Satuan
                  </label>
                  <Input
                    id="uom-code"
                    name="code"
                    placeholder="Contoh: PCS, SET, BOX"
                    defaultValue={values.code ?? editingRecord?.code ?? ""}
                    disabled={pending}
                  />
                </div>

                <div className="grid gap-1.5">
                  <label
                    htmlFor="uom-name"
                    className="text-xs font-semibold uppercase tracking-wider text-slate-800"
                  >
                    Nama Satuan
                  </label>
                  <Input
                    id="uom-name"
                    name="name"
                    placeholder="Contoh: Pieces, Set Instrumen"
                    defaultValue={values.name ?? editingRecord?.name ?? ""}
                    disabled={pending}
                  />
                </div>

                <label className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs font-semibold text-slate-800">
                  <input
                    type="checkbox"
                    name="isActive"
                    defaultChecked={
                      values.isActive === "false"
                        ? false
                        : values.isActive === "true"
                          ? true
                          : editingRecord?.is_active ?? true
                    }
                    disabled={pending}
                    className="h-4 w-4 rounded-md border-slate-300 text-sky-600 focus:ring-sky-500"
                  />
                  <span>Status Aktif</span>
                </label>

                <MasterDataFeedback
                  error={formState.error}
                  message={formState.message}
                />

                <div className="flex flex-wrap gap-2 pt-2">
                  <Button
                    type="submit"
                    disabled={pending}
                    variant="default"
                    size="lg"
                    className="flex-1"
                  >
                    <Save className="h-4 w-4" />
                    <span>{pending ? "Menyimpan..." : "Simpan Satuan"}</span>
                  </Button>
                  {editingRecord ? (
                    <Link href="/cssd/master-data/satuan" className={buttonVariants({ variant: "outline", size: "lg" })}>
                      <X className="h-4 w-4" />
                      <span>Batal</span>
                    </Link>
                  ) : null}
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
