import React from "react";

export function Loading() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/60 backdrop-blur-sm">
      <div className="flex items-center gap-3 rounded-lg bg-card px-5 py-4 shadow">
        <span className="h-5 w-5 animate-spin rounded-full border-2 border-muted-foreground/40 border-t-muted-foreground" />
        <span className="text-sm font-medium text-foreground">加载中...</span>
      </div>
    </div>
  );
}
