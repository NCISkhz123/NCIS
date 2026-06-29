import type { ReactNode } from "react";

type DataTableProps = {
  caption?: string;
  columns: string[];
  rows: Array<Array<ReactNode>>;
};

export function DataTable({ caption, columns, rows }: DataTableProps) {
  return (
    <div className="overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse">
          {caption ? (
            <caption className="border-b border-slate-200 px-5 py-4 text-left text-sm text-slate-500">
              {caption}
            </caption>
          ) : null}
          <thead className="bg-slate-50">
            <tr>
              {columns.map((column) => (
                <th
                  key={column}
                  scope="col"
                  className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-[0.24em] text-slate-500"
                >
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIndex) => (
              <tr
                key={`row-${rowIndex}`}
                className="border-t border-slate-200 align-top"
              >
                {row.map((cell, cellIndex) => (
                  <td
                    key={`cell-${rowIndex}-${cellIndex}`}
                    className="px-5 py-4 text-sm text-slate-700"
                  >
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
