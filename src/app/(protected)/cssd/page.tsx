import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth/profile";

export default async function CssdPage() {
  const profile = await getCurrentProfile();
  if (profile?.role === "USER") {
    redirect("/cssd/laporan/stok-status");
  }
  redirect("/cssd/pemasukan");
}
