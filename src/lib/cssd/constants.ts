export const ITEM_TYPES = [
  "REUSABLE",
  "CONSUMABLE_DISTRIBUTION",
  "CONSUMABLE_INTERNAL",
] as const;

export const ITEM_TYPE_LABELS = {
  REUSABLE: "Reusable",
  CONSUMABLE_DISTRIBUTION: "Konsumabel Distribusi",
  CONSUMABLE_INTERNAL: "Konsumabel Internal",
} as const;

export const ITEM_CODE_PREFIXES = {
  REUSABLE: "R",
  CONSUMABLE_DISTRIBUTION: "CD",
  CONSUMABLE_INTERNAL: "CI",
} as const;

export const REUSABLE_STOCK_POSITIONS = [
  "READY",
  "IN_UNIT",
  "NON_STERILE",
  "STERILIZATION_AREA",
  "DAMAGED",
] as const;

export const STOCK_POSITION_LABELS = {
  READY: "Siap Pakai",
  IN_UNIT: "Di Unit",
  NON_STERILE: "Tidak Steril",
  STERILIZATION_AREA: "Area Sterilisasi",
  DAMAGED: "Rusak",
} as const;

export const RETURN_DESTINATION_POSITIONS = [
  "NON_STERILE",
  "DAMAGED",
] as const;

export const DISTRIBUTABLE_ITEM_TYPES = [
  "REUSABLE",
  "CONSUMABLE_DISTRIBUTION",
] as const;

export const RETURNABLE_ITEM_TYPES = ["REUSABLE"] as const;

export const INTERNAL_USAGE_ITEM_TYPES = ["CONSUMABLE_INTERNAL"] as const;
