import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";

const envLocal = fs.readFileSync(".env.local", "utf-8");
const supabaseUrl = envLocal.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/)?.[1] || "";
const supabaseKey = envLocal.match(/SUPABASE_SERVICE_ROLE_KEY=(.*)/)?.[1] || "";

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  const { data, error } = await supabase
    .from("cssd_current_stock_report_v")
    .select("*")
    .is("hospital_unit_id", null)
    .in("stock_position", ["READY", "NON_STERILE", "STERILIZATION_AREA"]);

  console.log("Error from view:", error);
  console.log("Data length:", data?.length);
}

main();
