import { describe, expect, it } from "vitest";

import {
  escapeCsvField,
  serializeCsvRow,
  serializeCsvTable,
} from "@/lib/csv";

describe("csv helpers", () => {
  it("leaves plain fields unchanged", () => {
    expect(escapeCsvField("Alpha")).toBe("Alpha");
  });

  it("wraps fields containing commas in quotes", () => {
    expect(escapeCsvField("Alpha,Beta")).toBe('"Alpha,Beta"');
  });

  it("escapes quotes by doubling them", () => {
    expect(escapeCsvField('He said "ok"')).toBe('"He said ""ok"""');
  });

  it("wraps newline-containing fields in quotes", () => {
    expect(escapeCsvField("Line 1\nLine 2")).toBe('"Line 1\nLine 2"');
  });

  it("serializes rows with mixed values", () => {
    expect(serializeCsvRow(["Alpha", 2, null, undefined])).toBe("Alpha,2,,");
  });

  it("serializes a full table with CRLF line endings", () => {
    expect(
      serializeCsvTable({
        headers: ["A", "B"],
        rows: [["1", "2"]],
      })
    ).toBe("A,B\r\n1,2\r\n");
  });
});
