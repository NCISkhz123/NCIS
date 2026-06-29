"use client";

import Link from "next/link";
import { useActionState } from "react";

import { DataTable } from "@/components/data/data-table";
import { MasterDataFeedback } from "@/components/cssd/master-data/master-data-feedback";
import { StatusPill } from "@/components/cssd/master-data/status-pill";
import {
  initialHospitalUnitFormState,
  saveHospitalUnitAction,
  type HospitalUnitFormState,
} from "@/app/(protected)/cssd/master-data/unit/actions";
import type { HospitalUnitRow } from "@/lib/cssd/services/master-data";

type UnitMasterDataViewProps = {
  initialState?: HospitalUnitFormState;
  records: HospitalUnitRow[];
  editingRecord: HospitalUnitRow | null;
};

export function UnitMasterDataView({
  initialState = initialHospitalUnitFormState,
  records,
  editingRecord,
}: UnitMasterDataViewProps) {
  const [formState, formAction, pending] = useActionState(
    saveHospitalUnitAction,
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
            Kelola Unit CSSD
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">
            Unit dipakai sebagai tujuan distribusi dan pengembalian reusable.
            Pastikan kode dan nama unit terjaga konsisten.
          </p>

          <div className="mt-6">
            <DataTable
              caption="Daftar unit tujuan distribusi"
              columns={["Kode", "Nama", "Status", "Aksi"]}
              rows={records.map((record) => [
                record.code,
                record.name,
                <StatusPill key={`${record.id}-status`} active={record.is_active} />,
                <Link
                  key={`${record.id}-edit`}
                  href={`/cssd/master-data/unit?edit=${record.id}`}
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
            Form Unit
          </p>
          <h3 className="mt-3 text-xl font-semibold tracking-[-0.03em] text-slate-950">
            {editingRecord ? "Perbarui unit" : "Tambah unit baru"}
          </h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Gunakan data unit yang rapi agar distribusi dan pengembalian lebih
            mudah dilacak per area layanan.
          </p>

          <form action={formAction} className="mt-6 grid gap-4">
            <input type="hidden" name="id" value={editingRecord?.id ?? ""} />

            <div className="grid gap-2">
              <label htmlFor="unit-code" className="text-sm font-semibold text-slate-700">
                Kode Unit
              </label>
              <input
                id="unit-code"
                name="code"
                defaultValue={values.code ?? editingRecord?.code ?? ""}
                disabled={pending}
                className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400"
              />
            </div>

            <div className="grid gap-2">
              <label htmlFor="unit-name" className="text-sm font-semibold text-slate-700">
                Nama Unit
              </label>
              <input
                id="unit-name"
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
                {pending ? "Menyimpan..." : "Simpan Unit"}
              </button>
              {editingRecord ? (
                <Link
                  href="/cssd/master-data/unit"
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
