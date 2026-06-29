import { ITEM_CODE_PREFIXES } from "@/lib/cssd/constants";
import type { ItemType } from "@/lib/cssd/types";

type GenerateItemCodeInput = {
  itemType: ItemType;
  sequence: number;
};

export function generateItemCode({
  itemType,
  sequence,
}: GenerateItemCodeInput) {
  if (!Number.isInteger(sequence) || sequence < 1) {
    throw new RangeError("sequence must be a positive integer");
  }

  return `CSSD-${ITEM_CODE_PREFIXES[itemType]}-${String(sequence).padStart(4, "0")}`;
}
