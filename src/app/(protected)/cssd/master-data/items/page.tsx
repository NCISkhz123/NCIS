import { ItemMasterDataView } from "@/components/cssd/master-data/item-master-data-view";
import {
  createSupabaseMasterDataClient,
  listItems,
  listUnitOfMeasures,
} from "@/lib/cssd/services/master-data";
import { createServerSupabaseClient } from "@/lib/supabase/server";

type MasterDataItemsPageProps = {
  searchParams?: Promise<{
    edit?: string;
  }>;
};

export default async function MasterDataItemsPage({
  searchParams,
}: MasterDataItemsPageProps) {
  const params = (await searchParams) ?? {};
  const supabase = await createServerSupabaseClient();
  const client = createSupabaseMasterDataClient(supabase);

  const [itemsResult, uomsResult] = await Promise.all([
    listItems(client),
    listUnitOfMeasures(client),
  ]);

  const items = itemsResult.success ? itemsResult.data : [];
  const unitsOfMeasure = uomsResult.success ? uomsResult.data : [];
  const editingRecord = params.edit
    ? items.find((item) => item.id === params.edit) ?? null
    : null;

  return (
    <ItemMasterDataView
      items={items}
      unitsOfMeasure={unitsOfMeasure}
      editingRecord={editingRecord}
    />
  );
}
