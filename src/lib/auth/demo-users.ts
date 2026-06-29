import type { SupabaseClient, User } from "@supabase/supabase-js";

import type { CssdRole } from "./roles";

type DemoPasswordKey = "admin" | "petugas";

type DemoUserDefinition = {
  email: string;
  fullName: string;
  role: CssdRole;
  passwordKey: DemoPasswordKey;
};

type DemoAuthUser = {
  id: string;
};

type EnsureDemoUsersDeps = {
  adminAuth: {
    findUserByEmail(email: string): Promise<DemoAuthUser | null>;
    createUser(input: {
      email: string;
      password: string;
      email_confirm: boolean;
      user_metadata: {
        full_name: string;
      };
    }): Promise<DemoAuthUser>;
  };
  profiles: {
    upsertProfile(input: {
      userId: string;
      email: string;
      fullName: string;
      role: CssdRole;
    }): Promise<void>;
  };
  passwords: Record<DemoPasswordKey, string>;
};

const DEMO_USERS: DemoUserDefinition[] = [
  {
    email: "admin.cssd@ncis.local",
    fullName: "Admin CSSD",
    role: "ADMIN_CSSD",
    passwordKey: "admin",
  },
  {
    email: "petugas.cssd@ncis.local",
    fullName: "Petugas CSSD",
    role: "PETUGAS_CSSD",
    passwordKey: "petugas",
  },
];

export async function ensureDemoUsers({
  adminAuth,
  profiles,
  passwords,
}: EnsureDemoUsersDeps) {
  for (const demoUser of DEMO_USERS) {
    const existingUser = await adminAuth.findUserByEmail(demoUser.email);
    const authUser =
      existingUser ??
      (await adminAuth.createUser({
        email: demoUser.email,
        password: passwords[demoUser.passwordKey],
        email_confirm: true,
        user_metadata: {
          full_name: demoUser.fullName,
        },
      }));

    await profiles.upsertProfile({
      userId: authUser.id,
      email: demoUser.email,
      fullName: demoUser.fullName,
      role: demoUser.role,
    });
  }
}

function toAuthUser(user: User | null | undefined): DemoAuthUser | null {
  if (!user?.id) {
    return null;
  }

  return {
    id: user.id,
  };
}

export function createSupabaseAdminAuthAdapter(supabase: SupabaseClient) {
  return {
    async findUserByEmail(email: string) {
      const { data, error } = await supabase.auth.admin.listUsers();

      if (error) {
        throw new Error(error.message);
      }

      return (
        toAuthUser(
          data.users.find(
            (user) => user.email?.toLowerCase() === email.toLowerCase()
          )
        ) ?? null
      );
    },
    async createUser(input: {
      email: string;
      password: string;
      email_confirm: boolean;
      user_metadata: {
        full_name: string;
      };
    }) {
      const { data, error } = await supabase.auth.admin.createUser(input);

      if (error || !data.user) {
        throw new Error(error?.message ?? "Failed to create demo auth user.");
      }

      return {
        id: data.user.id,
      };
    },
  };
}

export function createSupabaseProfilesAdapter(supabase: SupabaseClient) {
  return {
    async upsertProfile(input: {
      userId: string;
      email: string;
      fullName: string;
      role: CssdRole;
    }) {
      const { error } = await supabase.from("profiles").upsert(
        {
          user_id: input.userId,
          email: input.email,
          full_name: input.fullName,
          app_role: input.role,
          is_active: true,
        },
        {
          onConflict: "email",
        }
      );

      if (error) {
        throw new Error(error.message);
      }
    },
  };
}
