import type { ReactNode } from "react";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  TableCaption,
} from "@/components/ui/table";

type DataTableProps = {
  caption?: string;
  columns: string[];
  rows: Array<Array<ReactNode>>;
};

export function DataTable({ caption, columns, rows }: DataTableProps) {
  return (
    <Table>
      {caption ? <TableCaption>{caption}</TableCaption> : null}
      <TableHeader>
        <TableRow>
          {columns.map((column) => (
            <TableHead key={column}>{column}</TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((row, rowIndex) => (
          <TableRow key={`row-${rowIndex}`}>
            {row.map((cell, cellIndex) => (
              <TableCell key={`cell-${rowIndex}-${cellIndex}`}>
                {cell}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
