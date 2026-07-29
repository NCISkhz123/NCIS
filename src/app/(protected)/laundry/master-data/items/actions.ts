"use server";

import { revalidatePath } from "next/cache";

import { requireLaundryAdminAccess } from "@/lib/auth/guards";
import {
  createItem,
  createSupabaseMasterDataClient,
  updateItem,
} from "@/lib/laundry/services/master-data";
import type { ItemFormState } from "@/lib/laundry/forms/master-data";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function saveItemAction(
  _previousState: ItemFormState,
  formData: FormData
): Promise<ItemFormState> {
  await requireLaundryAdminAccess();

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

  revalidatePath("/laundry/master-data/items");

  return {
    error: null,
    message: id ? "Item berhasil diperbarui." : "Item baru berhasil ditambahkan.",
  };
}

