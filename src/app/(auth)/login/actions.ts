import { redirect } from "next/navigation";
import { z } from "zod";

import { getDefaultModulePath } from "@/lib/auth/guards";
import { isModuleRole } from "@/lib/auth/roles";
import { getProfileRoleForUser } from "@/lib/auth/profile";
import { createServerSupabaseClient } from "@/lib/supabase/server";

const loginSchema = z.object({
  email: z.string().email("Email tidak valid"),
  password: z.string().min(1, "Password wajib diisi"),
});

export type LoginActionState =
  | {
      ok: false;
      message: string;
    }
  | {
      ok: true;
    };

export function normalizeLoginPayload(formData: FormData) {
  const parsed = loginSchema.safeParse({
    email: String(formData.get("email") ?? ""),
    password: String(formData.get("password") ?? ""),
  });

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Email tidak valid");
  }

  return parsed.data;
}

export async function loginWithPassword(
  authClient: {
    auth: {
      signInWithPassword(input: {
        email: string;
        password: string;
      }): Promise<{ error: { message: string } | null }>;
    };
  },
  input: {
    email: string;
    password: string;
  }
): Promise<LoginActionState> {
  const { error } = await authClient.auth.signInWithPassword(input);

  if (error) {
    return {
      ok: false,
      message: "Email atau password tidak sesuai.",
    };
  }

  return {
    ok: true,
  };
}

const MODULE_ACCESS_MESSAGE = "Akun ini belum memiliki akses NCIS.";

export async function loginAction(
  _: LoginActionState | null,
  formData: FormData
): Promise<LoginActionState> {
  "use server";

  let redirectTo: string | null = null;

  try {
    const payload = normalizeLoginPayload(formData);
    const supabase = await createServerSupabaseClient({
      writeCookies: true,
    });
    const result = await loginWithPassword(supabase, payload);

    if (!result.ok) {
      return result;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return {
        ok: false,
        message: "Login gagal. Coba lagi.",
      };
    }

    const role = await getProfileRoleForUser(supabase, user.id);

    if (!isModuleRole(role)) {
      await supabase.auth.signOut();

      return {
        ok: false,
        message: MODULE_ACCESS_MESSAGE,
      };
    }

    redirectTo = getDefaultModulePath(role);
  } catch (error) {
    return {
      ok: false,
      message:
        error instanceof Error ? error.message : "Login gagal. Coba lagi.",
    };
  }

  redirect(redirectTo ?? "/login");
}
