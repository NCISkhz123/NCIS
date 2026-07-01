export const CSSD_ROLES = ["ADMIN_CSSD", "PETUGAS_CSSD"] as const;
export const LAUNDRY_ROLES = ["ADMIN_LAUNDRY", "PETUGAS_LAUNDRY"] as const;

export type CssdRole = (typeof CSSD_ROLES)[number];
export type LaundryRole = (typeof LAUNDRY_ROLES)[number];
export type AppRole = CssdRole | LaundryRole | "USER" | null;

export function normalizeRole(value: unknown): AppRole {
  if (
    value === "ADMIN_CSSD" ||
    value === "PETUGAS_CSSD" ||
    value === "ADMIN_LAUNDRY" ||
    value === "PETUGAS_LAUNDRY" ||
    value === "USER"
  ) {
    return value;
  }

  return null;
}
