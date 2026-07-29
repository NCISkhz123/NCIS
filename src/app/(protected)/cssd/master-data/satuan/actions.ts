"use server";

import { revalidatePath } from "next/cache";

import { requireCssdAdminAccess } from "@/lib/auth/guards";
import type { UnitOfMeasureFormState } from "@/lib/cssd/forms/master-data";
import {
  createSupabaseMasterDataClient,
  createUnitOfMeasure,
  updateUnitOfMeasure,
} from "@/lib/cssd/services/master-data";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function saveUnitOfMeasureAction(
  _previousState: UnitOfMeasureFormState,
  formData: FormData
): Promise<UnitOfMeasureFormState> {
  await requireCssdAdminAccess();

  const code = String(formData.get("code") ?? "");
  const name = String(formData.get("name") ?? "");
  const isActive = formData.get("isActive") === "on";
  const id = String(formData.get("id") ?? "");

  const supabase = await createServerSupabaseClient({
    writeCookies: true,
  });
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
