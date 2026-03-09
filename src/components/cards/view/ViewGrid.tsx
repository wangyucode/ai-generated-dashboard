"use client";

import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { deleteView, getViews } from "@/app/actions/view";
import { useDataSourceStore } from "@/store/useDataSourceStore";
import { ViewCard } from "./ViewCard";

interface View {
  id: number;
  title: string;
  description?: string;
  query_sql: string;
  viz_config: string;
  layout_w: number;
  layout_h: number;
}

export function ViewGrid() {
  const { currentDataSource } = useDataSourceStore();
  const [views, setViews] = useState<View[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!currentDataSource) return;

    const fetchViews = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await getViews(currentDataSource.id);
        if (result.success) {
          setViews(result.data || []);
        } else {
          setError(result.error || "获取视图列表失败");
        }
      } catch (_e) {
        setError("获取视图列表时出错");
      } finally {
        setIsLoading(false);
      }
    };

    fetchViews();
  }, [currentDataSource]);

  const handleDelete = async (id: number) => {
    if (!confirm("确定要删除这个视图吗？")) return;

    try {
      const result = await deleteView(id);
      if (result.success) {
        setViews((prev) => prev.filter((v) => v.id !== id));
      } else {
        alert(result.error || "删除视图失败");
      }
    } catch (_e) {
      alert("删除视图时出错");
    }
  };

  const handleUpdate = (updatedView: View) => {
    setViews((prev) =>
      prev.map((v) => (v.id === updatedView.id ? updatedView : v)),
    );
  };

  if (!currentDataSource) return null;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12 col-span-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary/20" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="col-span-full p-8 text-center bg-destructive/5 rounded-lg border border-destructive/20">
        <p className="text-destructive font-medium">{error}</p>
      </div>
    );
  }

  return (
    <>
      {views.map((view) => (
        <ViewCard
          key={view.id}
          view={view}
          onDelete={() => handleDelete(view.id)}
          onUpdate={handleUpdate}
        />
      ))}
    </>
  );
}
