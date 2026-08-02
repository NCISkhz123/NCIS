const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

const envContent = fs.readFileSync('.env.local', 'utf-8');
const env = {};
envContent.split('\n').forEach(line => {
  const [key, ...values] = line.split('=');
  if (key && values.length > 0) {
    env[key.trim()] = values.join('=').trim().replace(/^"|"$/g, '');
  }
});

async function main() {
  const supabase = createClient(env['NEXT_PUBLIC_SUPABASE_URL'], env['SUPABASE_SERVICE_ROLE_KEY']);
  const unitId = '195937c2-4a69-4f60-9584-cf74c8bd5135'; // ICU
  
  const { data: moves, error: e1 } = await supabase.from('laundry_stock_movements').select('*').eq('hospital_unit_id', unitId);
  console.log('Laundry Stock Movements for ICU:', moves?.length, 'Error:', e1);
  
  const { data: report, error: e2 } = await supabase.from('laundry_transaction_history_report_v').select('*').eq('hospital_unit_id', unitId);
  console.log('Laundry Report View for ICU:', report?.length, 'Error:', e2);
  
  // also get ANY unit that has transactions in laundry
  const { data: anyMoves } = await supabase.from('laundry_stock_movements').select('*').not('hospital_unit_id', 'is', null).limit(1);
  console.log('Any laundry move with unit:', anyMoves);
}
main().catch(console.error);
