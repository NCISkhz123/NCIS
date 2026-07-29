export type ItemFormState = {
  error: string | null;
  message: string | null;
  values?: {
    code?: string;
    name?: string;
    itemType?: string;
    uomId?: string;
    notes?: string;
    isActive?: "true" | "false";
  };
};

export const initialItemFormState: ItemFormState = {
  error: null,
  message: null,
};

export type UnitOfMeasureFormState = {
  error: string | null;
  message: string | null;
  values?: {
    code?: string;
    name?: string;
    isActive?: "true" | "false";
  };
};

export const initialUnitOfMeasureFormState: UnitOfMeasureFormState = {
  error: null,
  message: null,
};

export type HospitalUnitFormState = {
  error: string | null;
  message: string | null;
  values?: {
    code?: string;
    name?: string;
    isActive?: "true" | "false";
  };
};

export const initialHospitalUnitFormState: HospitalUnitFormState = {
  error: null,
  message: null,
};
