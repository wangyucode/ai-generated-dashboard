"use client";

import { Database } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AddDataSourceDialog } from "./AddDataSourceDialog";

export function NoDataSourceFound() {
  return (
    <div className="flex flex-col items-center justify-center py-10 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-50">
        <Database className="h-6 w-6 text-blue-600" />
      </div>
      <h3 className="mt-4 text-lg font-semibold text-zinc-900">未连接数据源</h3>
      <p className="mt-2 text-sm text-zinc-500 max-w-xs mx-auto">
        请连接一个数据库以开始 AI 数据分析
      </p>
      <div className="mt-6">
        <AddDataSourceDialog>
          <Button className="px-8">添加数据源</Button>
        </AddDataSourceDialog>
      </div>
    </div>
  );
}
