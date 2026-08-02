"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Edit2, Save, X } from "lucide-react";

import { saveItemAction } from "@/app/(protected)/cssd/master-data/items/actions";
import { DataTable } from "@/components/data/data-table";
import { MasterDataFeedback } from "@/components/cssd/master-data/master-data-feedback";
import { StatusPill } from "@/components/cssd/master-data/status-pill";
import { ShellSectionHeading } from "@/components/layout/shell-section-heading";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  ITEM_TYPE_LABELS,
  ITEM_TYPES,
} from "@/lib/cssd/constants";
import {
  initialItemFormState,
  type ItemFormState,
} from "@/lib/cssd/forms/master-data";
import type {
  ItemRow,
  UnitOfMeasureRow,
} from "@/lib/cssd/services/master-data";

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
      <section className="grid gap-6 xl:grid-cols-12 items-start">
        {/* Left Table Section */}
        <div className="xl:col-span-7 space-y-4">
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-800">
                    Total {items.length} Item Terdaftar
                  </p>
                </div>
                <DataTable
                  caption="Daftar Katalog Item"
                  columns={["Nama Item", "Kode", "Jenis", "Satuan", "Status", "Aksi"]}
                  rows={items.map((item) => [
                    item.name,
                    <span key={`${item.id}-code`} className="font-mono text-xs font-bold text-slate-900">
                      {item.code}
                    </span>,
                    <Badge key={`${item.id}-type`} variant="info">
                      {ITEM_TYPE_LABELS[item.item_type]}
                    </Badge>,
                    uomLabelMap.get(item.uom_id) ?? item.uom_id,
                    <StatusPill key={`${item.id}-status`} active={item.is_active} />,
                    <Link
                      key={`${item.id}-edit`}
                      href={`/cssd/master-data/items?edit=${item.id}`}
                      className="inline-flex items-center gap-1 text-xs font-bold text-sky-700 hover:text-sky-900"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                      <span>Edit</span>
                    </Link>,
                  ])}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Sticky Form Section */}
        <div className="xl:col-span-5">
          <Card className="sticky top-24 border-slate-200 shadow-sm">
            <CardContent className="pt-6">
              <form action={formAction} className="grid gap-4">
                <input type="hidden" name="id" value={editingRecord?.id ?? ""} />

                <div className="grid gap-1.5">
                  <label
                    htmlFor="item-code"
                    className="text-xs font-semibold uppercase tracking-wider text-slate-800"
                  >
                    Kode item
                  </label>
                  <Input
                    id="item-code"
                    name="code"
                    placeholder="Contoh: ITM-001 (Opsional)"
                    defaultValue={values.code ?? editingRecord?.code ?? ""}
                    disabled={pending}
                  />
                </div>

                <div className="grid gap-1.5">
                  <label
                    htmlFor="item-name"
                    className="text-xs font-semibold uppercase tracking-wider text-slate-800"
                  >
                    Nama item
                  </label>
                  <Input
                    id="item-name"
                    name="name"
                    placeholder="Nama spesifikasi item..."
                    defaultValue={values.name ?? editingRecord?.name ?? ""}
                    disabled={pending}
                  />
                </div>

                <div className="grid gap-1.5">
                  <label
                    htmlFor="item-type"
                    className="text-xs font-semibold uppercase tracking-wider text-slate-800"
                  >
                    Jenis item
                  </label>
                  <Select
                    id="item-type"
                    name="itemType"
                    defaultValue={
                      values.itemType ?? editingRecord?.item_type ?? ITEM_TYPES[0]
                    }
                    disabled={pending}
                  >
                    {ITEM_TYPES.map((itemType) => (
                      <option key={itemType} value={itemType}>
                        {ITEM_TYPE_LABELS[itemType]}
                      </option>
                    ))}
                  </Select>
                </div>

                <div className="grid gap-1.5">
                  <label
                    htmlFor="item-uom"
                    className="text-xs font-semibold uppercase tracking-wider text-slate-800"
                  >
                    Satuan
                  </label>
                  <Select
                    id="item-uom"
                    name="uomId"
                    defaultValue={values.uomId ?? editingRecord?.uom_id ?? ""}
                    disabled={pending}
                  >
                    <option value="">Pilih satuan</option>
                    {unitsOfMeasure.map((uom) => (
                      <option key={uom.id} value={uom.id}>
                        {uom.name} ({uom.code})
                      </option>
                    ))}
                  </Select>
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
                  <span>Aktif</span>
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
                    <span>{pending ? "Menyimpan..." : "Simpan item"}</span>
                  </Button>
                  {editingRecord ? (
                    <Link href="/cssd/master-data/items" className={buttonVariants({ variant: "outline", size: "lg" })}>
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
