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
