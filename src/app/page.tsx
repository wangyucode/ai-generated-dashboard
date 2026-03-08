import { getDataSource } from "@/app/actions/dataSource";
import { DataSourceManager } from "@/components/cards/datasource/DataSourceManager";
import { AddViewCard } from "@/components/cards/view/AddViewCard";
import { ViewGrid } from "@/components/cards/view/ViewGrid";
import { StoreInitializer } from "@/components/StoreInitializer";

export default async function Home() {
  const dataSource = await getDataSource();

  return (
    <main className="container mx-auto p-4 md:p-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 md:gap-6 auto-rows-auto">
      <StoreInitializer dataSource={dataSource} />
      <DataSourceManager />
      {dataSource && <ViewGrid />}
      {dataSource && <AddViewCard />}
    </main>
  );
}
