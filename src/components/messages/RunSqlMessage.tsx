"use client";

import {
  type SqlResult,
  SqlResultTable,
} from "@/components/messages/SqlResultTable";

interface RunSqlMessageProps {
  part: {
    state: "input-available" | "output-available" | "output-error" | string;
    input?: unknown;
    output?: unknown;
    errorText?: string;
  };
  messageId: string;
  index: number;
}

export function RunSqlMessage({ part, messageId, index }: RunSqlMessageProps) {
  switch (part.state) {
    case "input-available":
      return (
        <div
          key={`${messageId}-part-${index}`}
          className="my-2 p-2 border rounded text-xs bg-muted/30"
        >
          <div className="mb-1 flex flex-wrap items-center gap-1.5">
            <span className="font-semibold text-muted-foreground">
              正在执行 SQL:
            </span>
            <code className="px-1.5 py-0.5 rounded bg-muted/50 border border-border/50 font-mono text-primary break-all">
              {(part.input as { sql: string }).sql}
            </code>
          </div>
        </div>
      );
    case "output-available": {
      const sqlResult = part.output as SqlResult;
      return (
        <div
          key={`${messageId}-part-${index}`}
          className="my-2 p-2 border rounded text-[10px]"
        >
          <div className="mb-1 flex flex-wrap items-center gap-1.5">
            <span className="font-semibold text-muted-foreground">
              执行 SQL:
            </span>
            <code className="px-1.5 py-0.5 rounded bg-muted/50 border border-border/50 font-mono text-primary break-all">
              {(part.input as { sql: string }).sql}
            </code>
          </div>
          <div className="bg-background rounded border overflow-hidden max-h-[300px]">
            {sqlResult?.success ? (
              <SqlResultTable data={sqlResult.data || []} />
            ) : (
              <div className="text-destructive text-sm p-2">
                Error: {sqlResult?.error || "未知错误"}
              </div>
            )}
          </div>
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
