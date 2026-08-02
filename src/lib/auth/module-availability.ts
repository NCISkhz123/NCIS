import type { AppRole } from "@/lib/auth/roles";
import type { ModuleKey } from "@/lib/modules";

export function getAvailableModuleKeys(role: AppRole): readonly ModuleKey[] {
  if (role === "KEPALA_SEKSI") {
    return ["CSSD", "LAUNDRY", "AMBULANCE"];
  }

  if (role === "ADMIN_CSSD" || role === "PETUGAS_CSSD") {
    return ["CSSD"];
  }

  if (role === "ADMIN_LAUNDRY" || role === "PETUGAS_LAUNDRY") {
    return ["LAUNDRY"];
  }

  if (role === "ADMIN_AMBULANCE" || role === "PETUGAS_AMBULANCE") {
    return ["AMBULANCE"];
  }

  return [];
}
