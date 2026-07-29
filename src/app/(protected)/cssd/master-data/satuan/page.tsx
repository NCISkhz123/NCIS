import { UomMasterDataView } from "@/components/cssd/master-data/uom-master-data-view";
import { requireCssdAdminAccess } from "@/lib/auth/guards";
import {
  createSupabaseMasterDataClient,
  listUnitOfMeasures,
} from "@/lib/cssd/services/master-data";
import { createServerSupabaseClient } from "@/lib/supabase/server";

type MasterDataSatuanPageProps = {
  searchParams?: Promise<{
    edit?: string;
  }>;
};

export default async function MasterDataSatuanPage({
  searchParams,
}: MasterDataSatuanPageProps) {
  await requireCssdAdminAccess();

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
