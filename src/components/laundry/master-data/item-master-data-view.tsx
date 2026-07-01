"use client";

import Link from "next/link";
import { useActionState } from "react";

import { DataTable } from "@/components/data/data-table";
import { MasterDataFeedback } from "@/components/laundry/master-data/master-data-feedback";
import { StatusPill } from "@/components/laundry/master-data/status-pill";
import {
  ITEM_TYPE_LABELS,
  ITEM_TYPES,
} from "@/lib/laundry/constants";
import type {
  ItemRow,
  UnitOfMeasureRow,
} from "@/lib/laundry/services/master-data";
import {
  initialItemFormState,
  saveItemAction,
  type ItemFormState,
} from "@/app/(protected)/laundry/master-data/items/actions";

type ItemMasterDataViewProps = {
  initialState?: ItemFormState;
  items: ItemRow[];
  unitsOfMeasure: UnitOfMeasureRow[];
  editingRecord: ItemRow | null;
};

export function ItemMasterDataView({
  initialState = initialItemFormState,
  items,
  unitsOfMeasure,
  editingRecord,
}: ItemMasterDataViewProps) {
  const [formState, formAction, pending] = useActionState(
    saveItemAction,
    initialState
  );

  const values = formState.values ?? {};
  const uomLabelMap = new Map(unitsOfMeasure.map((uom) => [uom.id, uom.name]));

  return (
    <div className="grid gap-6">
      <section className="grid gap-6 xl:grid-cols-[1.2fr_.8fr]">
        <div className="shell-surface rounded-[1.75rem] p-6">
          <p className="text-[0.72rem] font-semibold uppercase tracking-[0.28em] text-slate-500">
            Master Data
          </p>
          <h2 className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-slate-950">
            Kelola Item Laundry
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">
            Halaman ini dipakai untuk mengelola item reusable dan konsumabel
            yang menjadi dasar seluruh transaksi Laundry.
          </p>

          <div className="mt-6">
            <DataTable
              caption="Daftar item Laundry"
              columns={["Kode", "Nama", "Jenis", "Satuan", "Status", "Aksi"]}
              rows={items.map((item) => [
                item.code,
                item.name,
                ITEM_TYPE_LABELS[item.item_type],
                uomLabelMap.get(item.uom_id) ?? item.uom_id,
                <StatusPill key={`${item.id}-status`} active={item.is_active} />,
                <Link
                  key={`${item.id}-edit`}
                  href={`/laundry/master-data/items?edit=${item.id}`}
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
            Form Item
          </p>
          <h3 className="mt-3 text-xl font-semibold tracking-[-0.03em] text-slate-950">
            {editingRecord ? "Perbarui item" : "Tambah item baru"}
          </h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Kode item boleh diisi manual atau dikosongkan agar dibuat otomatis
            oleh sistem berdasarkan jenis item.
          </p>

          <form action={formAction} className="mt-6 grid gap-4">
            <input type="hidden" name="id" value={editingRecord?.id ?? ""} />

            <div className="grid gap-2">
              <label htmlFor="item-code" className="text-sm font-semibold text-slate-700">
                Kode Item
              </label>
              <input
                id="item-code"
                name="code"
                placeholder="Kosongkan untuk kode otomatis"
                defaultValue={values.code ?? editingRecord?.code ?? ""}
                disabled={pending}
                className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400"
              />
            </div>

            <div className="grid gap-2">
              <label htmlFor="item-name" className="text-sm font-semibold text-slate-700">
                Nama Item
              </label>
              <input
                id="item-name"
                name="name"
                defaultValue={values.name ?? editingRecord?.name ?? ""}
                disabled={pending}
                className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400"
              />
            </div>

            <div className="grid gap-2">
              <label htmlFor="item-type" className="text-sm font-semibold text-slate-700">
                Jenis Item
              </label>
              <select
                id="item-type"
                name="itemType"
                defaultValue={values.itemType ?? editingRecord?.item_type ?? ITEM_TYPES[0]}
                disabled={pending}
                className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400"
              >
                {ITEM_TYPES.map((itemType) => (
                  <option key={itemType} value={itemType}>
                    {ITEM_TYPE_LABELS[itemType]}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid gap-2">
              <label htmlFor="item-uom" className="text-sm font-semibold text-slate-700">
                Satuan
              </label>
              <select
                id="item-uom"
                name="uomId"
                defaultValue={values.uomId ?? editingRecord?.uom_id ?? ""}
                disabled={pending}
                className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400"
              >
                <option value="">Pilih satuan</option>
                {unitsOfMeasure.map((uom) => (
                  <option key={uom.id} value={uom.id}>
                    {uom.name} ({uom.code})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid gap-2">
              <label htmlFor="item-notes" className="text-sm font-semibold text-slate-700">
                Catatan
              </label>
              <textarea
                id="item-notes"
                name="notes"
                rows={4}
                defaultValue={values.notes ?? editingRecord?.notes ?? ""}
                disabled={pending}
                className="rounded-[1.35rem] border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400"
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
                {pending ? "Menyimpan..." : "Simpan Item"}
              </button>
              {editingRecord ? (
                <Link
                  href="/laundry/master-data/items"
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

