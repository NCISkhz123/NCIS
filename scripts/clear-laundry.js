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
const supabase = createClient(env['NEXT_PUBLIC_SUPABASE_URL'], env['SUPABASE_SERVICE_ROLE_KEY']);

async function clear() {
  console.log('Clearing laundry data...');
  
  const tables = [
    'laundry_receipt_transactions',
    'laundry_distribution_transactions',
    'laundry_return_transactions',
    'laundry_internal_usage_transactions',
    'laundry_stock_opname_sessions',
    'laundry_stock_movements',
    'laundry_stock_balances'
  ];

  for (const table of tables) {
    const { error } = await supabase.from(table).delete().neq('id', '00000000-0000-0000-0000-000000000000');
    if (error) {
      console.error('Error clearing', table, error);
    } else {
      console.log('Cleared', table);
    }
  }
  console.log('Done.');
}
clear().catch(console.error);
