"use client";

import { AlertCircle, Check, Layout, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { runSqlAction } from "@/app/actions/dataSource";
import type { GenerateViewArgs } from "@/components/cards/view/steps/AIChatStep";
import { Button } from "@/components/ui/button";
import { VegaChart } from "@/components/VegaChart";
import { useDataSourceStore } from "@/store/useDataSourceStore";

interface GenerateViewOutput {
  data: GenerateViewArgs;
  success: boolean;
  message: string;
}

interface GenerateViewPreviewProps {
  part: {
    state: "input-available" | "output-available" | "output-error" | string;
    input?: unknown;
    output?: unknown;
    errorText?: string;
  };
  messageId: string;
  index: number;
  onSave: (toolCallId: string, viewData: GenerateViewArgs) => void;
  isSaving: boolean;
}

export function GenerateViewPreview({
  part,
  messageId,
  index,
  onSave,
  isSaving,
}: GenerateViewPreviewProps) {
  const { currentDataSource } = useDataSourceStore();
  const [data, setData] = useState<Record<string, unknown>[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const output = part.output as GenerateViewOutput;
  const generateViewArgs = output?.data;

  useEffect(() => {
    if (
      part.state === "output-available" &&
      generateViewArgs &&
      currentDataSource
    ) {
      const fetchData = async () => {
        setIsLoading(true);
        setError(null);
        try {
          const result = await runSqlAction(
            currentDataSource.type,
            JSON.parse(currentDataSource.connection_info),
            generateViewArgs.query_sql,
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
    }
  }, [part.state, generateViewArgs, currentDataSource]);

  switch (part.state) {
    case "input-available":
      return (
        <div
          key={`${messageId}-part-${index}`}
          className="my-2 p-4 border rounded-lg bg-primary/5 border-primary/20"
        >
          <div className="flex items-center gap-2 mb-2 text-primary font-medium">
            <Layout className="h-4 w-4" />
            <span>正在生成视图配置...</span>
          </div>
        </div>
      );
    case "output-available": {
      const output = part.output as GenerateViewOutput;

      if (!output.success) {
        return (
          <div
            key={`${messageId}-part-${index}`}
            className="text-destructive text-sm my-2 p-4 border rounded-lg bg-destructive/5 border-destructive/20"
          >
            Error: {output.message || "生成视图失败"}
          </div>
        );
      }

      const generateViewArgs = output.data;
      return (
        <div
          key={`${messageId}-part-${index}`}
          className="my-2 p-4 border rounded-lg bg-primary/5 border-primary/20"
        >
          <div className="flex items-center gap-2 mb-2 text-primary font-medium">
            <Layout className="h-4 w-4" />
            <span>拟生成的视图配置</span>
          </div>
          <div className="space-y-1 mb-4 text-xs text-muted-foreground">
            <p>
              <span className="font-semibold text-foreground">标题:</span>{" "}
              {generateViewArgs.title}
            </p>
            {generateViewArgs.description && (
              <p>
                <span className="font-semibold text-foreground">描述:</span>{" "}
                {generateViewArgs.description}
              </p>
            )}
            <p>
              <span className="font-semibold text-foreground">大小:</span>{" "}
              {generateViewArgs.layout_w} x {generateViewArgs.layout_h}
              {generateViewArgs.layout_order !== undefined && (
                <>
                  <span className="mx-2 text-muted-foreground">|</span>
                  <span className="font-semibold text-foreground">
                    排序权重:
                  </span>{" "}
                  {generateViewArgs.layout_order}
                </>
              )}
            </p>
          </div>
          <div className="mb-4">
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
                <p className="text-xs text-destructive/80 font-medium">
                  {error}
                </p>
                <code className="text-[10px] text-destructive/60 break-all max-w-full">
                  {generateViewArgs.query_sql}
                </code>
              </div>
            ) : data ? (
              <VegaChart
                spec={generateViewArgs.viz_config}
                data={data}
                height={200}
              />
            ) : null}
          </div>
          <Button
            size="sm"
            className="w-full"
            onClick={() =>
              onSave(generateViewArgs.toolCallId, generateViewArgs)
            }
            disabled={isSaving}
          >
            {isSaving ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Check className="h-4 w-4 mr-2" />
            )}
            保存视图到仪表盘
          </Button>
        </div>
      );
    }
    case "output-error":
      return (
        <div
          key={`${messageId}-part-${index}`}
          className="text-destructive text-sm my-2"
        >
          Error: {part.errorText}
        </div>
      );
    default:
      return null;
  }
}
