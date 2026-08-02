const fs = require('fs');
const path = require('path');
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
  
  const { data: units } = await supabase.from('hospital_units').select('*').ilike('name', '%Intensive%');
  console.log('Units found:', units);
  
  if (units && units.length > 0) {
    const unitId = units[0].id;
    const { data: cssd_moves, error: e1 } = await supabase.from('stock_movements').select('*').eq('hospital_unit_id', unitId);
    console.log('CSSD Stock Movements for unit:', cssd_moves, 'Error:', e1);
    
    const { data: report_cssd, error: e2 } = await supabase.from('cssd_transaction_history_report_v').select('*').eq('hospital_unit_id', unitId);
    console.log('CSSD Report View for unit:', report_cssd, 'Error:', e2);
  }
}
main().catch(console.error);
