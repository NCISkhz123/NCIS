import ExcelJS from "exceljs";

export type ExcelTable = {
  title: string;
  period?: string;
  headers: string[];
  rows: (string | number | null | undefined)[][];
};

export async function buildExcelBuffer(table: ExcelTable): Promise<Uint8Array> {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Report");

  // Add title
  worksheet.mergeCells(`A1:${String.fromCharCode(64 + table.headers.length)}1`);
  const titleCell = worksheet.getCell("A1");
  titleCell.value = table.title;
  titleCell.font = { name: "Arial", size: 14, bold: true };
  titleCell.alignment = { vertical: "middle", horizontal: "center" };
  worksheet.getRow(1).height = 25;

  let headerRowIndex = 3;

  // Add period if exists
  if (table.period) {
    worksheet.mergeCells(`A2:${String.fromCharCode(64 + table.headers.length)}2`);
    const periodCell = worksheet.getCell("A2");
    periodCell.value = `Periode: ${table.period}`;
    periodCell.font = { name: "Arial", size: 11, italic: true };
    periodCell.alignment = { vertical: "middle", horizontal: "center" };
    headerRowIndex = 4;
  }

  // Add headers
  const headerRow = worksheet.getRow(headerRowIndex);
  table.headers.forEach((header, index) => {
    const cell = headerRow.getCell(index + 1);
    cell.value = header;
    cell.font = { name: "Arial", size: 10, bold: true };
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFE0E0E0" },
    };
    cell.border = {
      top: { style: "thin" },
      left: { style: "thin" },
      bottom: { style: "thin" },
      right: { style: "thin" },
    };
    cell.alignment = { vertical: "middle", horizontal: "center" };
  });

  // Add data rows
  table.rows.forEach((row, rowIndex) => {
    const dataRow = worksheet.getRow(headerRowIndex + 1 + rowIndex);
    row.forEach((value, colIndex) => {
      const cell = dataRow.getCell(colIndex + 1);
      cell.value = value ?? "-";
      cell.font = { name: "Arial", size: 10 };
      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
      
      // Right-align numbers
      if (typeof value === "number") {
        cell.alignment = { vertical: "middle", horizontal: "right" };
      } else {
        cell.alignment = { vertical: "middle", horizontal: "left" };
      }
    });
  });

  // Auto-fit columns
  worksheet.columns.forEach((column) => {
    let maxLength = 0;
    column.eachCell!({ includeEmpty: true }, (cell) => {
      const columnLength = cell.value ? cell.value.toString().length : 10;
      if (columnLength > maxLength) {
        maxLength = columnLength;
      }
    });
    // Limit max width so it doesn't get ridiculously wide, and set minimum width
    column.width = Math.min(Math.max(maxLength + 2, 10), 50);
  });

  const buffer = await workbook.xlsx.writeBuffer();
  return new Uint8Array(buffer);
}
