import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";

const env = readFileSync(".env.local", "utf-8");
let supabaseUrl = "";
let supabaseKey = "";

env.split("\n").forEach((line) => {
  if (line.startsWith("NEXT_PUBLIC_SUPABASE_URL=")) {
    supabaseUrl = line.split("=")[1].trim().replace(/['"]/g, "");
  }
  if (line.startsWith("NEXT_PUBLIC_SUPABASE_ANON_KEY=")) {
    supabaseKey = line.split("=")[1].trim().replace(/['"]/g, "");
  }
});

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  const { data: units } = await supabase.from("hospital_units").select("id, name");
  if (!units || units.length === 0) return console.log("No units");
  
  const unit = units.find(u => u.name.includes("IGD")) || units[0];
  console.log("Testing with unit:", unit.name, unit.id);
  
  const { data, error } = await supabase
    .from("cssd_current_stock_report_v")
    .select("*")
    .eq("hospital_unit_id", unit.id);
    
  if (error) return console.error(error);
  
  console.log("Returned rows:", data.length);
  const otherUnits = data.filter(d => d.hospital_unit_id !== unit.id);
  console.log("Rows with different unitId:", otherUnits.length);
  if (otherUnits.length > 0) console.log(otherUnits);
  
  console.log(data.slice(0, 2));
}
test();
