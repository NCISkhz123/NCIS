"use client";

import Link from "next/link";
import { useActionState } from "react";

import { saveUnitOfMeasureAction } from "@/app/(protected)/laundry/master-data/satuan/actions";
import { DataTable } from "@/components/data/data-table";
import { MasterDataFeedback } from "@/components/laundry/master-data/master-data-feedback";
import { StatusPill } from "@/components/laundry/master-data/status-pill";
import { ShellSectionHeading } from "@/components/layout/shell-section-heading";
import {
  initialUnitOfMeasureFormState,
  type UnitOfMeasureFormState,
} from "@/lib/laundry/forms/master-data";
import type { UnitOfMeasureRow } from "@/lib/laundry/services/master-data";

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
      <section className="grid gap-6 xl:grid-cols-[1.15fr_.85fr]">
        <div className="shell-surface rounded-[1.75rem] p-6 md:p-7">
          <div className="space-y-6">

            <div>
              <p className="mb-3 text-sm font-semibold text-slate-800">
                Daftar satuan
              </p>
              <DataTable
                caption="Daftar satuan"
                columns={["Nama", "Kode", "Status", "Aksi"]}
                rows={records.map((record) => [
                  record.name,
                  record.code,
                  <StatusPill key={`${record.id}-status`} active={record.is_active} />,
                  <Link
                    key={`${record.id}-edit`}
                    href={`/laundry/master-data/satuan?edit=${record.id}`}
                    className="text-sm font-semibold text-sky-700 underline-offset-4 hover:underline"
                  >
                    Edit
                  </Link>,
                ])}
              />
            </div>
          </div>
        </div>

        <section className="shell-surface rounded-[1.75rem] p-6">


          <form action={formAction} className="mt-6 grid gap-4">
            <input type="hidden" name="id" value={editingRecord?.id ?? ""} />

            <div className="grid gap-2">
              <label
                htmlFor="uom-code"
                className="text-sm font-semibold text-slate-700"
              >
                Kode satuan
              </label>
              <input
                id="uom-code"
                name="code"
                defaultValue={values.code ?? editingRecord?.code ?? ""}
                disabled={pending}
                className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400"
              />
            </div>

            <div className="grid gap-2">
              <label
                htmlFor="uom-name"
                className="text-sm font-semibold text-slate-700"
              >
                Nama satuan
              </label>
              <input
                id="uom-name"
                name="name"
                defaultValue={values.name ?? editingRecord?.name ?? ""}
                disabled={pending}
                className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400"
              />
            </div>

            <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
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
              />
              Aktif
            </label>

            <MasterDataFeedback
              error={formState.error}
              message={formState.message}
            />

            <div className="flex flex-wrap gap-3">
              <button
                type="submit"
                disabled={pending}
                className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {pending ? "Menyimpan..." : "Simpan satuan"}
              </button>
              {editingRecord ? (
                <Link
                  href="/laundry/master-data/satuan"
                  className="rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300"
                >
                  Batal
                </Link>
              ) : null}
            </div>
          </form>
        </section>
      </section>
    </div>
  );
}
