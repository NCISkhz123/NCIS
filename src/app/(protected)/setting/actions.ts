"use server";

import { revalidatePath } from "next/cache";
import { forbidden, redirect } from "next/navigation";

import { getCurrentProfile } from "@/lib/auth/profile";
import type { AppRole, CssdRole, LaundryRole } from "@/lib/auth/roles";
import { isModuleRole } from "@/lib/auth/guards";
import {
  createManagedAccount,
  updateOwnName,
  updateOwnPassword,
} from "@/lib/auth/settings";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export type SettingsActionState =
  | {
      ok: false;
      message: string;
    }
  | {
      ok: true;
      message: string;
    };

async function requireSettingsProfile() {
  const profile = await getCurrentProfile();

  if (!profile) {
    redirect("/login");
  }

  if (!isModuleRole(profile.role)) {
    forbidden();
  }

  return profile;
}

function getSettingsPath(role: AppRole) {
  if (role === "ADMIN_LAUNDRY" || role === "PETUGAS_LAUNDRY") {
    return "/laundry/setting";
  }

  return "/cssd/setting";
}

export async function updateNameAction(
  _: SettingsActionState | null,
  formData: FormData
): Promise<SettingsActionState> {
  const profile = await requireSettingsProfile();
  const supabase = await createServerSupabaseClient({
    writeCookies: true,
  });
  const result = await updateOwnName(supabase, {
    userId: profile.userId,
    fullName: String(formData.get("fullName") ?? ""),
  });

  if (!result.success) {
    return {
      ok: false,
      message: result.error,
    };
  }

  revalidatePath(getSettingsPath(profile.role));

  return {
    ok: true,
    message: "Nama berhasil diperbarui.",
  };
}

export async function updatePasswordAction(
  _: SettingsActionState | null,
  formData: FormData
): Promise<SettingsActionState> {
  await requireSettingsProfile();

  const password = String(formData.get("password") ?? "");
  const passwordConfirmation = String(formData.get("passwordConfirmation") ?? "");

  if (password !== passwordConfirmation) {
    return {
      ok: false,
      message: "Konfirmasi password tidak sama.",
    };
  }

  const supabase = await createServerSupabaseClient({
    writeCookies: true,
  });
  const result = await updateOwnPassword(supabase, { password });

  if (!result.success) {
    return {
      ok: false,
      message: result.error,
    };
  }

  return {
    ok: true,
    message: "Password berhasil diperbarui.",
  };
}

export async function createAccountAction(
  _: SettingsActionState | null,
  formData: FormData
): Promise<SettingsActionState> {
  const profile = await requireSettingsProfile();

  if (profile.role !== "ADMIN_CSSD" && profile.role !== "ADMIN_LAUNDRY") {
    forbidden();
  }

  const result = await createManagedAccount(
    createSupabaseAdminClient(),
    profile.role,
    {
      email: String(formData.get("email") ?? ""),
      fullName: String(formData.get("fullName") ?? ""),
      password: String(formData.get("password") ?? ""),
      role: String(formData.get("role") ?? "") as CssdRole | LaundryRole,
    }
  );

  if (!result.success) {
    return {
      ok: false,
      message: result.error,
    };
  }

  return {
    ok: true,
    message: "Akun berhasil dibuat.",
  };
}
