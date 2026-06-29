import { generateItemCode } from "@/lib/cssd/codegen/item-code";
import type { ItemType } from "@/lib/cssd/types";
import { itemFormSchema } from "@/lib/cssd/validators/item";
import { unitFormSchema } from "@/lib/cssd/validators/unit";
import { uomFormSchema } from "@/lib/cssd/validators/uom";
import {
  type ServiceResult,
  validationFailure,
} from "@/lib/cssd/services/stock";

type MasterDataTable = "units_of_measure" | "hospital_units" | "items";

type OrderBy = {
  column: string;
  ascending?: boolean;
};

type MasterDataClient = {
  findMany<T>(
    table: MasterDataTable,
    options?: {
      filters?: Record<string, unknown>;
      orderBy?: OrderBy;
    }
  ): Promise<{ data: T[] | null; error: { message: string } | null }>;
  insertOne<T>(
    table: MasterDataTable,
    payload: Record<string, unknown>
  ): Promise<{ data: T | null; error: { message: string } | null }>;
  updateById<T>(
    table: MasterDataTable,
    id: string,
    payload: Record<string, unknown>
  ): Promise<{ data: T | null; error: { message: string } | null }>;
};

type UnitOfMeasureRow = {
  id: string;
  code: string;
  name: string;
  is_active: boolean;
};

type HospitalUnitRow = {
  id: string;
  code: string;
  name: string;
  is_active: boolean;
};

type ItemRow = {
  id: string;
  code: string;
  name: string;
  item_type: ItemType;
  uom_id: string;
  notes: string | null;
  is_active: boolean;
};

function persistenceFailure(message: string): ServiceResult<never> {
  return {
    success: false,
    error: message,
  };
}

async function getItemsByType(
  client: MasterDataClient,
  itemType: ItemType
): Promise<ServiceResult<ItemRow[]>> {
  const { data, error } = await client.findMany<ItemRow>("items", {
    filters: { item_type: itemType },
    orderBy: { column: "created_at", ascending: true },
  });

  if (error || !data) {
    return persistenceFailure(error?.message ?? "Gagal mengambil daftar item");
  }

  return {
    success: true,
    data,
  };
}

async function ensureUniqueActiveItemCode(
  client: MasterDataClient,
  code: string,
  excludeItemId?: string
): Promise<ServiceResult<null>> {
  const { data, error } = await client.findMany<ItemRow>("items", {
    filters: { code, is_active: true },
  });

  if (error || !data) {
    return persistenceFailure(error?.message ?? "Gagal memeriksa kode item");
  }

  const duplicate = data.find((item) => item.id !== excludeItemId);

  if (duplicate) {
    return persistenceFailure("Kode item sudah dipakai oleh item aktif lain");
  }

  return {
    success: true,
    data: null,
  };
}

async function getNextGeneratedItemCode(
  client: MasterDataClient,
  itemType: ItemType
): Promise<ServiceResult<string>> {
  const itemsResult = await getItemsByType(client, itemType);

  if (!itemsResult.success) {
    return itemsResult;
  }

  const nextSequence =
    itemsResult.data.reduce((maxValue, item) => {
      const matched = item.code.match(/(\d{4})$/);
      const sequence = matched ? Number(matched[1]) : 0;
      return Math.max(maxValue, sequence);
    }, 0) + 1;

  return {
    success: true,
    data: generateItemCode({
      itemType,
      sequence: nextSequence,
    }),
  };
}

export async function createUnitOfMeasure(
  client: MasterDataClient,
  input: unknown
): Promise<ServiceResult<UnitOfMeasureRow>> {
  const parsed = uomFormSchema.safeParse(input);

  if (!parsed.success) {
    return validationFailure(parsed.error.issues);
  }

  const { data, error } = await client.insertOne<UnitOfMeasureRow>(
    "units_of_measure",
    {
      code: parsed.data.code,
      name: parsed.data.name,
      is_active: parsed.data.isActive,
    }
  );

  if (error || !data) {
    return persistenceFailure(error?.message ?? "Gagal membuat satuan");
  }

  return {
    success: true,
    data,
  };
}

export async function updateUnitOfMeasure(
  client: MasterDataClient,
  id: string,
  input: unknown
): Promise<ServiceResult<UnitOfMeasureRow>> {
  const parsed = uomFormSchema.safeParse(input);

  if (!parsed.success) {
    return validationFailure(parsed.error.issues);
  }

  const { data, error } = await client.updateById<UnitOfMeasureRow>(
    "units_of_measure",
    id,
    {
      code: parsed.data.code,
      name: parsed.data.name,
      is_active: parsed.data.isActive,
    }
  );

  if (error || !data) {
    return persistenceFailure(error?.message ?? "Gagal memperbarui satuan");
  }

  return {
    success: true,
    data,
  };
}

export async function archiveUnitOfMeasure(
  client: MasterDataClient,
  id: string
): Promise<ServiceResult<UnitOfMeasureRow>> {
  const { data, error } = await client.updateById<UnitOfMeasureRow>(
    "units_of_measure",
    id,
    {
      is_active: false,
    }
  );

  if (error || !data) {
    return persistenceFailure(error?.message ?? "Gagal mengarsipkan satuan");
  }

  return {
    success: true,
    data,
  };
}

export async function createHospitalUnit(
  client: MasterDataClient,
  input: unknown
): Promise<ServiceResult<HospitalUnitRow>> {
  const parsed = unitFormSchema.safeParse(input);

  if (!parsed.success) {
    return validationFailure(parsed.error.issues);
  }

  const { data, error } = await client.insertOne<HospitalUnitRow>(
    "hospital_units",
    {
      code: parsed.data.code,
      name: parsed.data.name,
      is_active: parsed.data.isActive,
    }
  );

  if (error || !data) {
    return persistenceFailure(error?.message ?? "Gagal membuat unit");
  }

  return {
    success: true,
    data,
  };
}

export async function updateHospitalUnit(
  client: MasterDataClient,
  id: string,
  input: unknown
): Promise<ServiceResult<HospitalUnitRow>> {
  const parsed = unitFormSchema.safeParse(input);

  if (!parsed.success) {
    return validationFailure(parsed.error.issues);
  }

  const { data, error } = await client.updateById<HospitalUnitRow>(
    "hospital_units",
    id,
    {
      code: parsed.data.code,
      name: parsed.data.name,
      is_active: parsed.data.isActive,
    }
  );

  if (error || !data) {
    return persistenceFailure(error?.message ?? "Gagal memperbarui unit");
  }

  return {
    success: true,
    data,
  };
}

export async function archiveHospitalUnit(
  client: MasterDataClient,
  id: string
): Promise<ServiceResult<HospitalUnitRow>> {
  const { data, error } = await client.updateById<HospitalUnitRow>(
    "hospital_units",
    id,
    {
      is_active: false,
    }
  );

  if (error || !data) {
    return persistenceFailure(error?.message ?? "Gagal mengarsipkan unit");
  }

  return {
    success: true,
    data,
  };
}

export async function createItem(
  client: MasterDataClient,
  input: unknown
): Promise<ServiceResult<ItemRow>> {
  const parsed = itemFormSchema.safeParse(input);

  if (!parsed.success) {
    return validationFailure(parsed.error.issues);
  }

  const codeResult =
    parsed.data.code === ""
      ? await getNextGeneratedItemCode(client, parsed.data.itemType)
      : {
          success: true as const,
          data: parsed.data.code,
        };

  if (!codeResult.success) {
    return codeResult;
  }

  const duplicateCheck = await ensureUniqueActiveItemCode(client, codeResult.data);

  if (!duplicateCheck.success) {
    return duplicateCheck;
  }

  const { data, error } = await client.insertOne<ItemRow>("items", {
    code: codeResult.data,
    item_type: parsed.data.itemType,
    name: parsed.data.name,
    uom_id: parsed.data.uomId,
    notes: parsed.data.notes ?? null,
    is_active: parsed.data.isActive,
  });

  if (error || !data) {
    return persistenceFailure(error?.message ?? "Gagal membuat item");
  }

  return {
    success: true,
    data,
  };
}

export async function updateItem(
  client: MasterDataClient,
  id: string,
  input: unknown
): Promise<ServiceResult<ItemRow>> {
  const parsed = itemFormSchema.safeParse(input);

  if (!parsed.success) {
    return validationFailure(parsed.error.issues);
  }

  const codeResult =
    parsed.data.code === ""
      ? await getNextGeneratedItemCode(client, parsed.data.itemType)
      : {
          success: true as const,
          data: parsed.data.code,
        };

  if (!codeResult.success) {
    return codeResult;
  }

  if (parsed.data.isActive) {
    const duplicateCheck = await ensureUniqueActiveItemCode(
      client,
      codeResult.data,
      id
    );

    if (!duplicateCheck.success) {
      return duplicateCheck;
    }
  }

  const { data, error } = await client.updateById<ItemRow>("items", id, {
    code: codeResult.data,
    item_type: parsed.data.itemType,
    name: parsed.data.name,
    uom_id: parsed.data.uomId,
    notes: parsed.data.notes ?? null,
    is_active: parsed.data.isActive,
  });

  if (error || !data) {
    return persistenceFailure(error?.message ?? "Gagal memperbarui item");
  }

  return {
    success: true,
    data,
  };
}
