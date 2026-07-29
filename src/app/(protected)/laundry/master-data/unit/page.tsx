import { UnitMasterDataView } from "@/components/laundry/master-data/unit-master-data-view";
import { requireLaundryAdminAccess } from "@/lib/auth/guards";
import {
  createSupabaseMasterDataClient,
  listHospitalUnits,
} from "@/lib/laundry/services/master-data";
import { createServerSupabaseClient } from "@/lib/supabase/server";

type MasterDataUnitPageProps = {
  searchParams?: Promise<{
    edit?: string;
  }>;
};

export default async function MasterDataUnitPage({
  searchParams,
}: MasterDataUnitPageProps) {
  await requireLaundryAdminAccess();

  const params = (await searchParams) ?? {};
  const supabase = await createServerSupabaseClient();
  const client = createSupabaseMasterDataClient(supabase);
  const recordsResult = await listHospitalUnits(client);
  const records = recordsResult.success ? recordsResult.data : [];
  const editingRecord = params.edit
    ? records.find((record) => record.id === params.edit) ?? null
    : null;

  return <UnitMasterDataView records={records} editingRecord={editingRecord} />;
}

