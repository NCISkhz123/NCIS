import { AmbulanceMasterView } from "@/components/ambulance/master/ambulance-master-view";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export default async function AmbulanceMasterPage() {
  const supabase = await createServerSupabaseClient();
  
  const [ambulancesResult, settingsResult] = await Promise.all([
    supabase.from("ambulances").select("*").order("name"),
    supabase.from("ambulance_settings").select("*").limit(1).maybeSingle()
  ]);

  if (ambulancesResult.error) {
    throw new Error(`Failed to load ambulances: ${ambulancesResult.error.message}`);
  }
  
  if (settingsResult.error) {
    throw new Error(`Failed to load ambulance settings: ${settingsResult.error.message}`);
  }

  return (
    <div className="mx-auto max-w-7xl p-4 md:p-8">
      <AmbulanceMasterView 
        initialAmbulances={ambulancesResult.data || []} 
        initialSettings={settingsResult.data || null} 
      />
    </div>
  );
}
