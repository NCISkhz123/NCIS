import type { AppRole } from "@/lib/auth/roles";
import type { ModuleKey } from "@/lib/modules";

export function getAvailableModuleKeys(role: AppRole): readonly ModuleKey[] {
  if (role === "ADMIN_CSSD" || role === "PETUGAS_CSSD") {
    return ["CSSD"];
  }

  if (role === "ADMIN_LAUNDRY" || role === "PETUGAS_LAUNDRY") {
    return ["LAUNDRY"];
  }

  return [];
}
