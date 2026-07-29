"use server";

import { revalidatePath } from "next/cache";

import { requireCssdAccess } from "@/lib/auth/guards";
import type { ItemFormState } from "@/lib/cssd/forms/master-data";
import {
  createItem,
  createSupabaseMasterDataClient,
  updateItem,
} from "@/lib/cssd/services/master-data";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function saveItemAction(
  _previousState: ItemFormState,
  formData: FormData
): Promise<ItemFormState> {
  await requireCssdAccess();

  const code = String(formData.get("code") ?? "");
  const name = String(formData.get("name") ?? "");
  const itemType = String(formData.get("itemType") ?? "");
  const uomId = String(formData.get("uomId") ?? "");
  const notes = String(formData.get("notes") ?? "");
  const isActive = formData.get("isActive") === "on";
  const id = String(formData.get("id") ?? "");

  const supabase = await createServerSupabaseClient({
    writeCookies: true,
  });
  const client = createSupabaseMasterDataClient(supabase);
  const payload = {
    code,
    name,
    itemType,
    uomId,
    notes,
    isActive,
  };

  const result = id
    ? await updateItem(client, id, payload)
    : await createItem(client, payload);

  if (!result.success) {
    return {
      error: result.error,
      message: null,
      values: {
        code,
        name,
        itemType,
        uomId,
        notes,
        isActive: isActive ? "true" : "false",
      },
    };
  }

  revalidatePath("/cssd/master-data/items");

  return {
    error: null,
    message: id ? "Item berhasil diperbarui." : "Item baru berhasil ditambahkan.",
  };
}
