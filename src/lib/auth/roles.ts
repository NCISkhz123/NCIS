export const CSSD_ROLES = ["ADMIN_CSSD", "PETUGAS_CSSD"] as const;

export type CssdRole = (typeof CSSD_ROLES)[number];
export type AppRole = CssdRole | "USER" | null;

export function normalizeRole(value: unknown): AppRole {
  if (value === "ADMIN_CSSD" || value === "PETUGAS_CSSD" || value === "USER") {
    return value;
  }

  return null;
}
