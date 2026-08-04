import { forbidden, redirect } from "next/navigation";

import { getCurrentProfile } from "./profile";
import {
  type AppRole,
  isKepalaSeksi,
  isCssdRole,
  isCssdAdminRole,
  isLaundryRole,
  isLaundryAdminRole,
  isAmbulanceRole,
  isAmbulanceAdminRole,
  isModuleRole,
} from "./roles";

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
  if (role === "USER") {
    return "/cssd/laporan/stok-status";
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
    hasModuleRole: (r) => isCssdRole(r) || isKepalaSeksi(r) || (isModuleRole(r) && pathname.startsWith("/cssd/laporan")),
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
    hasModuleRole: (r) => isLaundryRole(r) || isKepalaSeksi(r) || (isModuleRole(r) && pathname.startsWith("/laundry/laporan")),
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
