import type {
  DISTRIBUTABLE_ITEM_TYPES,
  INTERNAL_USAGE_ITEM_TYPES,
  ITEM_TYPES,
  RETURNABLE_ITEM_TYPES,
  RETURN_DESTINATION_POSITIONS,
  REUSABLE_STOCK_POSITIONS,
} from "@/lib/laundry/constants";

export type ItemType = (typeof ITEM_TYPES)[number];
export type ReusableStockPosition = (typeof REUSABLE_STOCK_POSITIONS)[number];
export type ReturnDestinationPosition =
  (typeof RETURN_DESTINATION_POSITIONS)[number];
export type DistributableItemType = (typeof DISTRIBUTABLE_ITEM_TYPES)[number];
export type ReturnableItemType = (typeof RETURNABLE_ITEM_TYPES)[number];
export type InternalUsageItemType =
  (typeof INTERNAL_USAGE_ITEM_TYPES)[number];
