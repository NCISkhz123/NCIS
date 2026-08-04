import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth/profile";

export default async function LaundryPage() {
  const profile = await getCurrentProfile();
  if (profile?.role === "USER") {
    redirect("/laundry/laporan/stok-status");
  }
  redirect("/laundry/pemasukan");
}

