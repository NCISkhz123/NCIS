import type { ItemType } from "@/lib/laundry/types";

export type UnitOfMeasureRow = {
  id: string;
  code: string;
  name: string;
  is_active: boolean;
};

export type HospitalUnitRow = {
  id: string;
  code: string;
  name: string;
  is_active: boolean;
};

export type ItemRow = {
  id: string;
  code: string;
  name: string;
  item_type: ItemType;
  uom_id: string;
  notes: string | null;
  is_active: boolean;
};
