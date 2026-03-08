"use client";

import { Calendar, Database, MapPin, Table } from "lucide-react";
import type { DataSource } from "@/types/database";

interface DataSourceInfoProps {
  dataSource: DataSource;
}

export function DataSourceInfo({ dataSource }: DataSourceInfoProps) {
  const createdDate = new Date(dataSource.created_at).toLocaleDateString(
    "zh-CN",
    {
      year: "numeric",
      month: "long",
      day: "numeric",
    },
  );

  return (
    <div className="flex flex-col gap-4 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
            <Database className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-zinc-900">{dataSource.name}</h3>
            <p className="text-xs text-zinc-500 uppercase tracking-wider">
              {dataSource.type}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
        <div className="flex items-center gap-2 text-sm text-zinc-600">
          <MapPin className="h-4 w-4 text-zinc-400" />
          <span className="truncate" title={dataSource.database}>
            {dataSource.database}
          </span>
        </div>
        <div className="flex items-center gap-2 text-sm text-zinc-600">
          <Table className="h-4 w-4 text-zinc-400" />
          <span>{dataSource.table_count} 个数据表</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-zinc-600">
          <Calendar className="h-4 w-4 text-zinc-400" />
          <span>创建于 {createdDate}</span>
        </div>
      </div>
    </div>
  );
}
