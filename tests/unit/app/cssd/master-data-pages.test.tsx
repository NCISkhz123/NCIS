// @vitest-environment jsdom

import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { ItemMasterDataView } from "@/components/cssd/master-data/item-master-data-view";
import { UomMasterDataView } from "@/components/cssd/master-data/uom-master-data-view";
import { UnitMasterDataView } from "@/components/cssd/master-data/unit-master-data-view";

vi.mock("@/lib/cssd/forms/master-data", () => ({
  initialItemFormState: {
    error: null,
    message: null,
  },
  initialUnitOfMeasureFormState: {
    error: null,
    message: null,
  },
  initialHospitalUnitFormState: {
    error: null,
    message: null,
  },
}));

vi.mock("@/app/(protected)/cssd/master-data/items/actions", () => ({
  saveItemAction: vi.fn(),
}));

vi.mock("@/app/(protected)/cssd/master-data/satuan/actions", () => ({
  saveUnitOfMeasureAction: vi.fn(),
}));

vi.mock("@/app/(protected)/cssd/master-data/unit/actions", () => ({
  saveHospitalUnitAction: vi.fn(),
}));

describe("CSSD master data pages", () => {
  it("renders the item page with the core item form fields", () => {
    render(
      <ItemMasterDataView
        items={[]}
        unitsOfMeasure={[
          {
            id: "b2d8ce72-8a95-4f58-84c8-0700015772db",
            code: "PCS",
            name: "Pieces",
            is_active: true,
          },
        ]}
        editingRecord={null}
      />
    );

    expect(
      screen.getByRole("heading", { name: /data item/i })
    ).toBeVisible();
    expect(
      screen.getByRole("heading", { name: /tambah item/i })
    ).toBeVisible();
    expect(screen.getByLabelText(/kode item/i)).toBeVisible();
    expect(screen.getByLabelText(/nama item/i)).toBeVisible();
    expect(screen.getByLabelText(/jenis item/i)).toBeVisible();
    expect(screen.getByLabelText(/^satuan$/i)).toBeVisible();
    expect(
      screen.getByRole("button", { name: /simpan item/i })
    ).toBeVisible();
  });

  it("renders the satuan page with the unit of measure form", () => {
    render(<UomMasterDataView records={[]} editingRecord={null} />);

    expect(
      screen.getByRole("heading", { name: /data satuan/i })
    ).toBeVisible();
    expect(
      screen.getByRole("heading", { name: /tambah satuan/i })
    ).toBeVisible();
    expect(screen.getByLabelText(/kode satuan/i)).toBeVisible();
    expect(screen.getByLabelText(/nama satuan/i)).toBeVisible();
    expect(
      screen.getByRole("button", { name: /simpan satuan/i })
    ).toBeVisible();
  });

  it("renders the unit page with the hospital unit form", () => {
    render(<UnitMasterDataView records={[]} editingRecord={null} />);

    expect(
      screen.getByRole("heading", { name: /data unit/i })
    ).toBeVisible();
    expect(
      screen.getByRole("heading", { name: /tambah unit/i })
    ).toBeVisible();
    expect(screen.getByLabelText(/kode unit/i)).toBeVisible();
    expect(screen.getByLabelText(/nama unit/i)).toBeVisible();
    expect(screen.getByRole("button", { name: /simpan unit/i })).toBeVisible();
  });
});
