import { AlertCircle } from "lucide-react";
import { getAIConfig } from "@/app/actions/aiConfig";
import { getDataSource } from "@/app/actions/dataSource";
import { DataSourceManager } from "@/components/cards/datasource/DataSourceManager";
import { AddViewCard } from "@/components/cards/view/AddViewCard";
import { ViewGrid } from "@/components/cards/view/ViewGrid";
import { StoreInitializer } from "@/components/StoreInitializer";

export default async function Home() {
  const dataSource = await getDataSource();
  const aiConfig = await getAIConfig();
  const aiConfigured = !!(
    aiConfig?.base_url &&
    aiConfig?.model_id &&
    aiConfig?.api_key
  );

  return (
    <main className="container mx-auto p-4 md:p-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 md:gap-6 auto-rows-auto">
      {!aiConfigured && (
        <div className="col-span-full flex items-center justify-between rounded-md border border-amber-200 bg-amber-50 p-3 text-amber-800 -order-2">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            <span>未检测到 AI 配置。请点击右上角“设置”进行配置。</span>
          </div>
        </div>
      )}
      <StoreInitializer dataSource={dataSource} />
      <DataSourceManager />
      {dataSource && <ViewGrid />}
      {dataSource && <AddViewCard aiConfigured={aiConfigured} />}
    </main>
  );
}
