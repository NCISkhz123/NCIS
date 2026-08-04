export const CSSD_ROLES = ["ADMIN_CSSD", "PETUGAS_CSSD"] as const;
export const LAUNDRY_ROLES = ["ADMIN_LAUNDRY", "PETUGAS_LAUNDRY"] as const;
export const AMBULANCE_ROLES = ["ADMIN_AMBULANCE", "PETUGAS_AMBULANCE"] as const;
export const KEPALA_SEKSI_ROLES = ["KEPALA_SEKSI"] as const;

export type CssdRole = (typeof CSSD_ROLES)[number];
export type LaundryRole = (typeof LAUNDRY_ROLES)[number];
export type AmbulanceRole = (typeof AMBULANCE_ROLES)[number];
export type KepalaSeksiRole = (typeof KEPALA_SEKSI_ROLES)[number];
export type AppRole = CssdRole | LaundryRole | AmbulanceRole | KepalaSeksiRole | "USER" | null;

export function normalizeRole(value: unknown): AppRole {
  if (
    value === "ADMIN_CSSD" ||
    value === "PETUGAS_CSSD" ||
    value === "ADMIN_LAUNDRY" ||
    value === "PETUGAS_LAUNDRY" ||
    value === "ADMIN_AMBULANCE" ||
    value === "PETUGAS_AMBULANCE" ||
    value === "KEPALA_SEKSI" ||
    value === "USER"
  ) {
    return value;
  }

  return null;
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

export function isModuleRole(role: AppRole): role is CssdRole | LaundryRole | AmbulanceRole | KepalaSeksiRole | "USER" {
  return isCssdRole(role) || isLaundryRole(role) || isAmbulanceRole(role) || isKepalaSeksi(role) || role === "USER";
}
