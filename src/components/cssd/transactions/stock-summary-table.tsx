"use client";

import { useState, Fragment } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  TableCaption,
} from "@/components/ui/table";
import { ITEM_TYPE_LABELS } from "@/lib/cssd/constants";
import type { StockSummaryEntry } from "@/lib/cssd/services/transaction-read-models";

type StockSummaryTableProps = {
  caption: string;
  rows: StockSummaryEntry[];
  isGrouped?: boolean;
};

export function StockSummaryTable({ caption, rows, isGrouped = false }: StockSummaryTableProps) {
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});

  const toggleExpand = (itemId: string) => {
    setExpandedItems((prev) => ({
      ...prev,
      [itemId]: !prev[itemId],
    }));
  };

  // Group by item
  const groupedRows: Record<string, {
    itemId: string;
    itemCode: string;
    itemName: string;
    itemType: "REUSABLE" | "CONSUMABLE";
    totalQty: number;
    details: StockSummaryEntry[];
  }> = {};

  rows.forEach((row) => {
    if (!groupedRows[row.itemId]) {
      groupedRows[row.itemId] = {
        itemId: row.itemId,
        itemCode: row.itemCode,
        itemName: row.itemName,
        itemType: row.itemType as "REUSABLE" | "CONSUMABLE",
        totalQty: 0,
        details: [],
      };
    }
    groupedRows[row.itemId].totalQty += row.quantity;
    groupedRows[row.itemId].details.push(row);
  });

  const groupArray = Object.values(groupedRows).sort((a, b) => a.itemName.localeCompare(b.itemName));

  return (
    <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
      <Table>
        {caption && <TableCaption>{caption}</TableCaption>}
        <TableHeader className="bg-slate-50/80">
          <TableRow>
            {isGrouped && <TableHead className="w-[40px]"></TableHead>}
            <TableHead>Nama Item</TableHead>
            <TableHead>Kode Item</TableHead>
            <TableHead>Jenis</TableHead>
            <TableHead>Posisi</TableHead>
            <TableHead>Unit</TableHead>
            <TableHead className="text-right">Qty</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={isGrouped ? 7 : 6} className="text-center py-8 text-slate-500">
                Belum ada stok yang tersedia
              </TableCell>
            </TableRow>
          ) : !isGrouped ? (
            rows.map((row, idx) => (
              <TableRow key={`${row.itemId}-${idx}`} className="hover:bg-slate-50/80 transition-colors">
                <TableCell className="font-medium text-slate-900">{row.itemName}</TableCell>
                <TableCell className="font-medium text-slate-700">{row.itemCode}</TableCell>
                <TableCell>
                  <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700">
                    {ITEM_TYPE_LABELS[row.itemType]}
                  </span>
                </TableCell>
                <TableCell className="text-slate-600">{row.stockPositionLabel}</TableCell>
                <TableCell className="text-slate-600">{row.hospitalUnitName ?? "-"}</TableCell>
                <TableCell className="text-right font-mono tabular-nums font-semibold text-slate-900 text-base">
                  {row.quantity}
                </TableCell>
              </TableRow>
            ))
          ) : (
            groupArray.map((group) => {
              const isExpanded = expandedItems[group.itemId];
              return (
                <Fragment key={group.itemId}>
                  <TableRow 
                    className="cursor-pointer hover:bg-slate-50/80 transition-colors"
                    onClick={() => toggleExpand(group.itemId)}
                  >
                    <TableCell>
                      {isExpanded ? (
                        <ChevronDown className="h-4 w-4 text-slate-500 transition-transform duration-200" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-slate-400 transition-transform duration-200" />
                      )}
                    </TableCell>
                    <TableCell className="font-medium text-slate-900">{group.itemName}</TableCell>
                    <TableCell className="font-medium text-slate-700">{group.itemCode}</TableCell>
                    <TableCell>
                      <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700">
                        {ITEM_TYPE_LABELS[group.itemType]}
                      </span>
                    </TableCell>
                    <TableCell className="text-slate-400">-</TableCell>
                    <TableCell className="text-slate-400">-</TableCell>
                    <TableCell className="text-right font-mono tabular-nums font-semibold text-slate-900 text-base">
                      {group.totalQty}
                    </TableCell>
                  </TableRow>
                  {isExpanded && group.details.map((detail, idx) => (
                    <TableRow key={`${group.itemId}-${idx}`} className="bg-slate-50/40 border-t-0">
                      <TableCell></TableCell>
                      <TableCell></TableCell>
                      <TableCell></TableCell>
                      <TableCell></TableCell>
                      <TableCell className="pl-6 text-sm text-slate-600 border-l-2 border-slate-200">
                        {detail.stockPositionLabel}
                      </TableCell>
                      <TableCell className="text-sm text-slate-600">
                        {detail.hospitalUnitName ?? "-"}
                      </TableCell>
                      <TableCell className="text-right font-mono tabular-nums text-sm text-slate-600">
                        {detail.quantity}
                      </TableCell>
                    </TableRow>
                  ))}
                </Fragment>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
}
