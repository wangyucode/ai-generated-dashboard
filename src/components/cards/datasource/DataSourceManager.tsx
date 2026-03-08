"use client";

import { deleteDataSource } from "@/app/actions/dataSource";
import { useDataSourceStore } from "@/store/useDataSourceStore";
import { DashboardCard } from "../../DashboardCard";
import { DataSourceInfo } from "./DataSourceInfo";
import { NoDataSourceFound } from "./NoDataSourceFound";

export function DataSourceManager() {
  const { currentDataSource, setCurrentDataSource } = useDataSourceStore();

  const handleDelete = async () => {
    if (!currentDataSource) return;

    if (
      !confirm(
        `确定要删除数据源 "${currentDataSource.name}" 吗？\n此操作将同时删除所有关联的视图。`,
      )
    )
      return;

    try {
      const result = await deleteDataSource(currentDataSource.id);
      if (result.success) {
        setCurrentDataSource(null);
      } else {
        alert(result.error || "删除数据源失败");
      }
    } catch (error) {
      console.error("Failed to delete data source:", error);
      alert("删除数据源时发生错误");
    }
  };

  return (
    <DashboardCard
      title="数据源管理"
      desc={
        currentDataSource
          ? "当前已连接的数据源信息"
          : "连接数据库以开始 AI 数据分析"
      }
      rowSpan={2}
      colSpan={2}
      order={-1}
      onDelete={currentDataSource ? handleDelete : undefined}
    >
      {currentDataSource ? (
        <DataSourceInfo dataSource={currentDataSource} />
      ) : (
        <NoDataSourceFound />
      )}
    </DashboardCard>
  );
}
