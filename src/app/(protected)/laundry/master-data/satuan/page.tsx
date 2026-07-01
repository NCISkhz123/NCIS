import { UomMasterDataView } from "@/components/laundry/master-data/uom-master-data-view";
import {
  createSupabaseMasterDataClient,
  listUnitOfMeasures,
} from "@/lib/laundry/services/master-data";
import { createServerSupabaseClient } from "@/lib/supabase/server";

type MasterDataSatuanPageProps = {
  searchParams?: Promise<{
    edit?: string;
  }>;
};

export default async function MasterDataSatuanPage({
  searchParams,
}: MasterDataSatuanPageProps) {
  const params = (await searchParams) ?? {};
  const supabase = await createServerSupabaseClient();
  const client = createSupabaseMasterDataClient(supabase);
  const recordsResult = await listUnitOfMeasures(client);
  const records = recordsResult.success ? recordsResult.data : [];
  const editingRecord = params.edit
    ? records.find((record) => record.id === params.edit) ?? null
    : null;

  return <UomMasterDataView records={records} editingRecord={editingRecord} />;
}

