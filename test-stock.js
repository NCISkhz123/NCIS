import { createClient } from '@supabase/supabase-js';

// We need to test the view `cssd_current_stock_report_v` directly
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  const { data: units } = await supabase.from('hospital_units').select('id, name').limit(1);
  const unitId = units?.[0]?.id;
  
  if (unitId) {
    console.log("Testing with unitId", unitId);
    const { data } = await supabase.from('cssd_current_stock_report_v').select('*').eq('hospital_unit_id', unitId).limit(5);
    console.log(data);
  }
}
main();
