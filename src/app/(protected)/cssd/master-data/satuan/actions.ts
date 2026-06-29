"use server";

import { revalidatePath } from "next/cache";

import { requireCssdAccess } from "@/lib/auth/guards";
import {
  createSupabaseMasterDataClient,
  createUnitOfMeasure,
  updateUnitOfMeasure,
} from "@/lib/cssd/services/master-data";
import { createServerSupabaseClient } from "@/lib/supabase/server";

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

export async function saveUnitOfMeasureAction(
  _previousState: UnitOfMeasureFormState,
  formData: FormData
): Promise<UnitOfMeasureFormState> {
  await requireCssdAccess();

  const code = String(formData.get("code") ?? "");
  const name = String(formData.get("name") ?? "");
  const isActive = formData.get("isActive") === "on";
  const id = String(formData.get("id") ?? "");

  const supabase = await createServerSupabaseClient();
  const client = createSupabaseMasterDataClient(supabase);
  const payload = {
    code,
    name,
    isActive,
  };

  const result = id
    ? await updateUnitOfMeasure(client, id, payload)
    : await createUnitOfMeasure(client, payload);

  if (!result.success) {
    return {
      error: result.error,
      message: null,
      values: {
        code,
        name,
        isActive: isActive ? "true" : "false",
      },
    };
  }

  revalidatePath("/cssd/master-data/satuan");

  return {
    error: null,
    message: id
      ? "Satuan berhasil diperbarui."
      : "Satuan baru berhasil ditambahkan.",
  };
}
