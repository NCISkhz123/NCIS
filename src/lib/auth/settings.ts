import type { SupabaseClient } from "@supabase/supabase-js";

import type { AppRole, CssdRole, LaundryRole } from "@/lib/auth/roles";

type CreatableRole = CssdRole | LaundryRole;

type Result =
  | {
      success: true;
    }
  | {
      success: false;
      error: string;
    };

type ProfileWriter = Pick<SupabaseClient, "from">;

type PasswordUpdater = {
  auth: {
    updateUser(input: { password: string }): Promise<{
      error: { message: string } | null;
    }>;
  };
};

type AccountCreator = {
  auth: {
    admin: {
      createUser(input: {
        email: string;
        password: string;
        email_confirm: boolean;
        user_metadata: {
          full_name: string;
        };
      }): Promise<{
        data: {
          user: {
            id: string;
          } | null;
        };
        error: { message: string } | null;
      }>;
      deleteUser?(userId: string): Promise<{ error: { message: string } | null }>;
    };
  };
  from: SupabaseClient["from"];
};

export function getCreatableRolesForAdmin(role: AppRole): readonly CreatableRole[] {
  if (role === "ADMIN_CSSD") {
    return ["ADMIN_CSSD", "PETUGAS_CSSD"];
  }

  if (role === "ADMIN_LAUNDRY") {
    return ["ADMIN_LAUNDRY", "PETUGAS_LAUNDRY"];
  }

  return [];
}

export async function updateOwnName(
  supabase: ProfileWriter,
  input: {
    userId: string;
    fullName: string;
  }
): Promise<Result> {
  const fullName = input.fullName.trim();

  if (!fullName) {
    return {
      success: false,
      error: "Nama wajib diisi.",
    };
  }

  const { error } = await supabase
    .from("profiles")
    .update({ full_name: fullName })
    .eq("user_id", input.userId);

  if (error) {
    return {
      success: false,
      error: error.message,
    };
  }

  return { success: true };
}

export async function updateOwnPassword(
  supabase: PasswordUpdater,
  input: {
    password: string;
  }
): Promise<Result> {
  const password = input.password.trim();

  if (password.length < 8) {
    return {
      success: false,
      error: "Password minimal 8 karakter.",
    };
  }

  const { error } = await supabase.auth.updateUser({ password });

  if (error) {
    return {
      success: false,
      error: error.message,
    };
  }

  return { success: true };
}

export async function createManagedAccount(
  supabase: AccountCreator,
  adminRole: AppRole,
  input: {
    email: string;
    fullName: string;
    password: string;
    role: CreatableRole;
  }
): Promise<Result> {
  const creatableRoles = getCreatableRolesForAdmin(adminRole);

  if (!creatableRoles.includes(input.role)) {
    return {
      success: false,
      error: "Role akun tidak sesuai dengan modul admin.",
    };
  }

  const email = input.email.trim().toLowerCase();
  const fullName = input.fullName.trim();
  const password = input.password.trim();

  if (!email || !fullName || password.length < 8) {
    return {
      success: false,
      error: "Email, nama, dan password minimal 8 karakter wajib diisi.",
    };
  }

  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      full_name: fullName,
    },
  });

  if (error || !data.user) {
    return {
      success: false,
      error: error?.message ?? "Akun gagal dibuat.",
    };
  }

  const { error: profileError } = await supabase.from("profiles").upsert(
    {
      user_id: data.user.id,
      email,
      full_name: fullName,
      app_role: input.role,
      is_active: true,
    },
    { onConflict: "email" }
  );

  if (profileError) {
    if (supabase.auth.admin.deleteUser) {
      await supabase.auth.admin.deleteUser(data.user.id);
    }
    return {
      success: false,
      error: profileError.message,
    };
  }

  return { success: true };
}
