import { forbidden, redirect } from "next/navigation";

import { getCurrentProfile } from "./profile";
import type { AppRole, CssdRole, LaundryRole, AmbulanceRole, KepalaSeksiRole } from "./roles";

type ModuleAccessInput = {
  pathname: string;
  role: AppRole;
  userId: string | null;
};

type ModuleAccessDecision =
  | {
      allowed: true;
    }
  | {
      allowed: false;
      reason: "unauthenticated" | "forbidden";
      redirectTo: string;
    };

function decideModuleRouteAccess({
  pathname,
  role,
  userId,
  basePath,
  hasModuleRole,
  hasMasterDataAccess,
}: ModuleAccessInput & {
  basePath: string;
  hasModuleRole(role: AppRole): boolean;
  hasMasterDataAccess(role: AppRole): boolean;
}): ModuleAccessDecision {
  if (!pathname.startsWith(basePath)) {
    return { allowed: true };
  }

  if (!userId) {
    return {
      allowed: false,
      redirectTo: "/login",
      reason: "unauthenticated",
    };
  }

  if (!hasModuleRole(role)) {
    return {
      allowed: false,
      redirectTo: "/login",
      reason: "forbidden",
    };
  }

  if (isMasterDataRoute(pathname, basePath) && !hasMasterDataAccess(role)) {
    return {
      allowed: false,
      redirectTo: "/login",
      reason: "forbidden",
    };
  }

  return { allowed: true };
}

function isMasterDataRoute(pathname: string, basePath: string) {
  const masterDataPath = `${basePath}/master-data`;

  return pathname === masterDataPath || pathname.startsWith(`${masterDataPath}/`);
}

export function isKepalaSeksi(role: AppRole): role is KepalaSeksiRole {
  return role === "KEPALA_SEKSI";
}

export function isCssdRole(role: AppRole): role is CssdRole {
  return role === "ADMIN_CSSD" || role === "PETUGAS_CSSD";
}

export function isCssdAdminRole(role: AppRole): role is "ADMIN_CSSD" {
  return role === "ADMIN_CSSD";
}

export function isLaundryRole(role: AppRole): role is LaundryRole {
  return role === "ADMIN_LAUNDRY" || role === "PETUGAS_LAUNDRY";
}

export function isLaundryAdminRole(role: AppRole): role is "ADMIN_LAUNDRY" {
  return role === "ADMIN_LAUNDRY";
}

export function isAmbulanceRole(role: AppRole): role is AmbulanceRole {
  return role === "ADMIN_AMBULANCE" || role === "PETUGAS_AMBULANCE";
}

export function isAmbulanceAdminRole(role: AppRole): role is "ADMIN_AMBULANCE" {
  return role === "ADMIN_AMBULANCE";
}

export function isModuleRole(role: AppRole): role is CssdRole | LaundryRole | AmbulanceRole | KepalaSeksiRole {
  return isCssdRole(role) || isLaundryRole(role) || isAmbulanceRole(role) || isKepalaSeksi(role);
}

export function getDefaultModulePath(role: AppRole) {
  if (isKepalaSeksi(role)) {
    return "/cssd/pemasukan";
  }
  if (isCssdRole(role)) {
    return "/cssd/pemasukan";
  }
  if (isLaundryRole(role)) {
    return "/laundry";
  }
  if (isAmbulanceRole(role)) {
    return "/ambulance/order";
  }
  return "/login";
}

export function decideCssdRouteAccess({
  pathname,
  role,
  userId,
}: ModuleAccessInput): ModuleAccessDecision {
  return decideModuleRouteAccess({
    pathname,
    role,
    userId,
    basePath: "/cssd",
    hasModuleRole: (r) => isCssdRole(r) || isKepalaSeksi(r),
    hasMasterDataAccess: (r) => isCssdAdminRole(r) || isKepalaSeksi(r),
  });
}

export function decideLaundryRouteAccess({
  pathname,
  role,
  userId,
}: ModuleAccessInput): ModuleAccessDecision {
  return decideModuleRouteAccess({
    pathname,
    role,
    userId,
    basePath: "/laundry",
    hasModuleRole: (r) => isLaundryRole(r) || isKepalaSeksi(r),
    hasMasterDataAccess: (r) => isLaundryAdminRole(r) || isKepalaSeksi(r),
  });
}

export function decideAmbulanceRouteAccess({
  pathname,
  role,
  userId,
}: ModuleAccessInput): ModuleAccessDecision {
  return decideModuleRouteAccess({
    pathname,
    role,
    userId,
    basePath: "/ambulance",
    hasModuleRole: (r) => isAmbulanceRole(r) || isKepalaSeksi(r),
    hasMasterDataAccess: (r) => isAmbulanceAdminRole(r) || isKepalaSeksi(r),
  });
}

export async function requireCssdAccess(pathname = "/cssd") {
  const profile = await getCurrentProfile();

  const decision = decideCssdRouteAccess({
    pathname,
    role: profile?.role ?? null,
    userId: profile?.userId ?? null,
  });

  if (decision.allowed) {
    if (!profile) {
      redirect("/login");
    }

    return profile;
  }

  if (decision.reason === "unauthenticated") {
    redirect(decision.redirectTo);
  }

  forbidden();
}

export async function requireCssdAdminAccess() {
  return requireCssdAccess("/cssd/master-data");
}

export async function requireLaundryAccess(pathname = "/laundry") {
  const profile = await getCurrentProfile();

  const decision = decideLaundryRouteAccess({
    pathname,
    role: profile?.role ?? null,
    userId: profile?.userId ?? null,
  });

  if (decision.allowed) {
    if (!profile) {
      redirect("/login");
    }

    return profile;
  }

  if (decision.reason === "unauthenticated") {
    redirect(decision.redirectTo);
  }

  forbidden();
}

export async function requireLaundryAdminAccess() {
  return requireLaundryAccess("/laundry/master-data");
}

export async function requireAmbulanceAccess(pathname = "/ambulance") {
  const profile = await getCurrentProfile();

  const decision = decideAmbulanceRouteAccess({
    pathname,
    role: profile?.role ?? null,
    userId: profile?.userId ?? null,
  });

  if (decision.allowed) {
    if (!profile) {
      redirect("/login");
    }

    return profile;
  }

  if (decision.reason === "unauthenticated") {
    redirect(decision.redirectTo);
  }

  forbidden();
}

export async function requireAmbulanceAdminAccess() {
  return requireAmbulanceAccess("/ambulance/master");
}
