import { UnitMasterDataView } from "@/components/cssd/master-data/unit-master-data-view";
import {
  createSupabaseMasterDataClient,
  listHospitalUnits,
} from "@/lib/cssd/services/master-data";
import { createServerSupabaseClient } from "@/lib/supabase/server";

type MasterDataUnitPageProps = {
  searchParams?: Promise<{
    edit?: string;
  }>;
};

export default async function MasterDataUnitPage({
  searchParams,
}: MasterDataUnitPageProps) {
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
