// @vitest-environment jsdom

import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { ItemMasterDataView } from "@/components/cssd/master-data/item-master-data-view";
import { UomMasterDataView } from "@/components/cssd/master-data/uom-master-data-view";
import { UnitMasterDataView } from "@/components/cssd/master-data/unit-master-data-view";

vi.mock("@/app/(protected)/cssd/master-data/items/actions", () => ({
  initialItemFormState: {
    error: null,
    message: null,
  },
  saveItemAction: vi.fn(),
}));

vi.mock("@/app/(protected)/cssd/master-data/satuan/actions", () => ({
  initialUnitOfMeasureFormState: {
    error: null,
    message: null,
  },
  saveUnitOfMeasureAction: vi.fn(),
}));

vi.mock("@/app/(protected)/cssd/master-data/unit/actions", () => ({
  initialHospitalUnitFormState: {
    error: null,
    message: null,
  },
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
      screen.getByRole("heading", { name: /kelola item cssd/i })
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
      screen.getByRole("heading", { name: /kelola satuan cssd/i })
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
      screen.getByRole("heading", { name: /kelola unit cssd/i })
    ).toBeVisible();
    expect(screen.getByLabelText(/kode unit/i)).toBeVisible();
    expect(screen.getByLabelText(/nama unit/i)).toBeVisible();
    expect(screen.getByRole("button", { name: /simpan unit/i })).toBeVisible();
  });
});
