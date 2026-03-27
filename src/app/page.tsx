"use client";

import { useEffect } from "react";
import { getAIConfig } from "@/app/actions/aiConfig";
import { getDataSource } from "@/app/actions/dataSource";
import { useDataSourceStore } from "@/store/useDataSourceStore";
import { DataSourceManager } from "@/components/cards/datasource/DataSourceManager";
import { ViewGrid } from "@/components/cards/view/ViewGrid";
import { AIConfigAlert } from "@/components/cards/datasource/AIConfigAlert";

export default function Home() {
  const { currentDataSource, aiConfig, setCurrentDataSource, setAIConfig } =
    useDataSourceStore();

  useEffect(() => {
    async function fetchData() {
      const ds = await getDataSource();
      const config = await getAIConfig();
      setCurrentDataSource(ds);
      setAIConfig(config);
    }
    fetchData();
  }, [setCurrentDataSource, setAIConfig]);

  const aiConfigured = !!aiConfig;

  return (
    <main className="container mx-auto p-4 md:p-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 md:gap-6 auto-rows-auto">
      {!aiConfigured && <AIConfigAlert />}
      <DataSourceManager />
      {currentDataSource && <ViewGrid />}
    </main>
  );
}
