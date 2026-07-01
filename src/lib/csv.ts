type CsvValue = string | number | null | undefined;

function normalizeCsvValue(value: CsvValue) {
  if (value === null || value === undefined) {
    return "";
  }

  return String(value);
}

export function escapeCsvField(value: CsvValue) {
  const normalized = normalizeCsvValue(value);

  if (!/[",\r\n]/.test(normalized)) {
    return normalized;
  }

  return `"${normalized.replaceAll('"', '""')}"`;
}

export function serializeCsvRow(values: CsvValue[]) {
  return values.map(escapeCsvField).join(",");
}

export function serializeCsvTable(input: {
  headers: string[];
  rows: CsvValue[][];
}) {
  const lines = [
    serializeCsvRow(input.headers),
    ...input.rows.map((row) => serializeCsvRow(row)),
  ];

  return `${lines.join("\r\n")}\r\n`;
}
