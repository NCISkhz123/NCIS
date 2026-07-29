"use server";

import { revalidatePath } from "next/cache";

import { requireLaundryAdminAccess } from "@/lib/auth/guards";
import {
  createHospitalUnit,
  createSupabaseMasterDataClient,
  updateHospitalUnit,
} from "@/lib/laundry/services/master-data";
import type { HospitalUnitFormState } from "@/lib/laundry/forms/master-data";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function saveHospitalUnitAction(
  _previousState: HospitalUnitFormState,
  formData: FormData
): Promise<HospitalUnitFormState> {
  await requireLaundryAdminAccess();

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
    ? await updateHospitalUnit(client, id, payload)
    : await createHospitalUnit(client, payload);

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

  revalidatePath("/laundry/master-data/unit");

  return {
    error: null,
    message: id ? "Unit berhasil diperbarui." : "Unit baru berhasil ditambahkan.",
  };
}

