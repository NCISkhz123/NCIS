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
  
  // Simulate createSupabaseReportClient.findMany
  let query = supabase.from('cssd_transaction_history_report_v').select('*');
  
  const filters = [
    { column: 'item_id', operator: 'eq', value: undefined },
    { column: 'hospital_unit_id', operator: 'eq', value: unitId },
    { column: 'occurred_at', operator: 'gte', value: undefined },
    { column: 'occurred_at', operator: 'lte', value: undefined },
  ];
  
  for (const filter of filters) {
    if (filter.value === undefined || filter.value === '') {
      continue;
    }
    
    if (filter.operator === 'eq') {
      query = filter.value === null ? query.is(filter.column, null) : query.eq(filter.column, filter.value);
    }
    if (filter.operator === 'gte') {
      query = query.gte(filter.column, filter.value);
    }
    if (filter.operator === 'lte') {
      query = query.lte(filter.column, filter.value);
    }
  }
  
  query = query.order('occurred_at', { ascending: false }).limit(50);
  
  const { data, error } = await query;
  console.log('Result length:', data?.length);
  console.log('Error:', error);
}

main().catch(console.error);
