import type { ReactNode } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface DashboardCardProps {
  title: string;
  desc?: string;
  colSpan?: number;
  rowSpan?: number;
  order?: number;
  children: ReactNode;
}

export function DashboardCard({
  title,
  desc,
  colSpan = 1,
  rowSpan = 1,
  order = 0,
  children,
}: DashboardCardProps) {
  return (
    <Card
      style={{
        gridColumn: colSpan ? `span ${colSpan}` : undefined,
        gridRow: rowSpan ? `span ${rowSpan}` : undefined,
        order: order,
      }}
      className="flex flex-col h-full"
    >
      <CardHeader className="p-0 px-6">
        <CardTitle className="text-sm font-semibold tracking-tight">
          {title}
        </CardTitle>
        {desc && (
          <CardDescription className="text-xs text-muted-foreground">
            {desc}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="flex-1 p-0 px-6">{children}</CardContent>
    </Card>
  );
}
