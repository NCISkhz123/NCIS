"use client";

import Link from "next/link";
import { useActionState } from "react";

import { DataTable } from "@/components/data/data-table";
import { MasterDataFeedback } from "@/components/laundry/master-data/master-data-feedback";
import { StatusPill } from "@/components/laundry/master-data/status-pill";
import {
  initialUnitOfMeasureFormState,
  saveUnitOfMeasureAction,
  type UnitOfMeasureFormState,
} from "@/app/(protected)/laundry/master-data/satuan/actions";
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
        <div className="shell-surface rounded-[1.75rem] p-6">
          <p className="text-[0.72rem] font-semibold uppercase tracking-[0.28em] text-slate-500">
            Master Data
          </p>
          <h2 className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-slate-950">
            Kelola Satuan Laundry
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">
            Satuan dipakai sebagai referensi utama item dan transaksi. Form ini
            mendukung tambah baru maupun edit data yang sudah ada.
          </p>

          <div className="mt-6">
            <DataTable
              caption="Daftar satuan aktif dan nonaktif"
              columns={["Kode", "Nama", "Status", "Aksi"]}
              rows={records.map((record) => [
                record.code,
                record.name,
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

        <section className="shell-surface rounded-[1.75rem] p-6">
          <p className="text-[0.72rem] font-semibold uppercase tracking-[0.28em] text-slate-500">
            Form Satuan
          </p>
          <h3 className="mt-3 text-xl font-semibold tracking-[-0.03em] text-slate-950">
            {editingRecord ? "Perbarui satuan" : "Tambah satuan baru"}
          </h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Isi kode dan nama satuan dengan format yang konsisten agar master
            data lebih mudah dipakai ulang.
          </p>

          <form action={formAction} className="mt-6 grid gap-4">
            <input type="hidden" name="id" value={editingRecord?.id ?? ""} />

            <div className="grid gap-2">
              <label htmlFor="uom-code" className="text-sm font-semibold text-slate-700">
                Kode Satuan
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
              <label htmlFor="uom-name" className="text-sm font-semibold text-slate-700">
                Nama Satuan
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
              Status aktif
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
                {pending ? "Menyimpan..." : "Simpan Satuan"}
              </button>
              {editingRecord ? (
                <Link
                  href="/laundry/master-data/satuan"
                  className="rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300"
                >
                  Batal Edit
                </Link>
              ) : null}
            </div>
          </form>
        </section>
      </section>
    </div>
  );
}

