"use client";

export interface SqlResult {
  success: boolean;
  data?: Record<string, unknown>[];
  error?: string;
}

interface SqlResultTableProps {
  data: Record<string, unknown>[];
}

export function SqlResultTable({ data }: SqlResultTableProps) {
  if (!Array.isArray(data) || data.length === 0) {
    return <div className="text-muted-foreground italic p-2">无数据结果</div>;
  }

  const columns = Object.keys(data[0]);

  return (
    <div className="overflow-x-auto max-w-full">
      <table className="min-w-full divide-y divide-border text-[10px] border-collapse">
        <thead>
          <tr className="bg-muted/50">
            {columns.map((col) => (
              <th
                key={col}
                className="px-2 py-1.5 text-left font-semibold text-muted-foreground border-b border-r last:border-r-0 sticky top-0 bg-muted/50"
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {data.map((row, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: SQL results may not have a unique ID
            <tr key={i} className="hover:bg-muted/30">
              {columns.map((col) => (
                <td
                  key={col}
                  className="px-2 py-1 whitespace-nowrap border-b border-r last:border-r-0"
                >
                  {row[col] === null || row[col] === undefined
                    ? "-"
                    : typeof row[col] === "object"
                      ? JSON.stringify(row[col])
                      : String(row[col])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
