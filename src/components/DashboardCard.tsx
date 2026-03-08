import { Settings, Trash2 } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
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
  onDelete?: () => void;
  onSettings?: () => void;
}

export function DashboardCard({
  title,
  desc,
  colSpan = 1,
  rowSpan = 1,
  order = 0,
  children,
  onDelete,
  onSettings,
}: DashboardCardProps) {
  return (
    <Card
      style={{
        gridColumn: colSpan ? `span ${colSpan}` : undefined,
        gridRow: rowSpan ? `span ${rowSpan}` : undefined,
        order: order,
      }}
      className="flex flex-col h-full group"
    >
      <CardHeader className="p-0 px-6 flex flex-row items-start justify-between space-y-0">
        <div className="flex flex-col space-y-1 pr-4">
          <CardTitle className="text-sm font-semibold tracking-tight leading-none mt-1">
            {title}
          </CardTitle>
          {desc && (
            <CardDescription className="text-xs text-muted-foreground">
              {desc}
            </CardDescription>
          )}
        </div>
        <div className="flex items-center gap-1 shrink-0">
          {onSettings && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
              onClick={onSettings}
            >
              <Settings className="h-4 w-4" />
            </Button>
          )}
          {onDelete && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-destructive"
              onClick={onDelete}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex-1 p-0 px-6">{children}</CardContent>
    </Card>
  );
}
