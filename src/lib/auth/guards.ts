import { forbidden, redirect } from "next/navigation";

import { getCurrentProfile } from "./profile";
import type { AppRole, CssdRole } from "./roles";

type CssdAccessInput = {
  pathname: string;
  role: AppRole;
  userId: string | null;
};

type CssdAccessDecision =
  | {
      allowed: true;
    }
  | {
      allowed: false;
      reason: "unauthenticated" | "forbidden";
      redirectTo: string;
    };

export function isCssdRole(role: AppRole): role is CssdRole {
  return role === "ADMIN_CSSD" || role === "PETUGAS_CSSD";
}

export function decideCssdRouteAccess({
  pathname,
  role,
  userId,
}: CssdAccessInput): CssdAccessDecision {
  if (!pathname.startsWith("/cssd")) {
    return { allowed: true };
  }

  if (!userId) {
    return {
      allowed: false,
      redirectTo: "/login",
      reason: "unauthenticated",
    };
  }

  if (!isCssdRole(role)) {
    return {
      allowed: false,
      redirectTo: "/login",
      reason: "forbidden",
    };
  }

  return { allowed: true };
}

export async function requireCssdAccess() {
  const profile = await getCurrentProfile();

  const decision = decideCssdRouteAccess({
    pathname: "/cssd",
    role: profile?.role ?? null,
    userId: profile?.userId ?? null,
  });

  if (decision.allowed) {
    return profile;
  }

  if (decision.reason === "unauthenticated") {
    redirect(decision.redirectTo);
  }

  forbidden();
}
