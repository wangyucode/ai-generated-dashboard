"use client";

import { AlertCircle, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { runSqlAction } from "@/app/actions/dataSource";
import { DashboardCard } from "@/components/DashboardCard";
import { VegaChart } from "@/components/VegaChart";
import { useDataSourceStore } from "@/store/useDataSourceStore";

interface View {
  id: number;
  title: string;
  description?: string;
  query_sql: string;
  viz_config: string;
  layout_w: number;
  layout_h: number;
}

interface ViewCardProps {
  view: View;
}

export function ViewCard({ view }: ViewCardProps) {
  const { currentDataSource } = useDataSourceStore();
  const [data, setData] = useState<Record<string, unknown>[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!currentDataSource) return;

    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await runSqlAction(
          currentDataSource.type,
          JSON.parse(currentDataSource.connection_info),
          view.query_sql,
        );
        if (result.success) {
          setData((result.data as Record<string, unknown>[]) || []);
        } else {
          setError(result.error || "获取图表数据失败");
        }
      } catch (_e) {
        setError("获取图表数据时出错");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [currentDataSource, view.query_sql]);

  return (
    <DashboardCard
      title={view.title}
      desc={view.description}
      colSpan={view.layout_w}
      rowSpan={view.layout_h}
    >
      <div className="w-full min-h-[200px] py-4">
        {isLoading ? (
          <div className="w-full h-[200px] flex flex-col items-center justify-center gap-2 bg-muted/20 rounded-lg border border-dashed animate-pulse">
            <Loader2 className="h-6 w-6 animate-spin text-primary/40" />
            <span className="text-xs text-muted-foreground italic">
              正在加载图表数据...
            </span>
          </div>
        ) : error ? (
          <div className="w-full h-[200px] flex flex-col items-center justify-center gap-2 bg-destructive/5 rounded-lg border border-destructive/20 p-4 text-center">
            <AlertCircle className="h-6 w-6 text-destructive/40" />
            <p className="text-xs text-destructive/80 font-medium">{error}</p>
          </div>
        ) : data ? (
          <VegaChart
            spec={view.viz_config}
            data={data}
            height={Math.max(200, view.layout_h * 100)}
          />
        ) : null}
      </div>
    </DashboardCard>
  );
}
