import { Clock, FileText, HardDrive, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLogStore } from "@/store/useLogStore";

export function InitCardContent() {
  const { selectedLog, logFiles } = useLogStore();

  const fileInfo = logFiles.find((f) => f.name === selectedLog);

  if (!fileInfo) return null;

  const formatSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / k ** i).toFixed(2))} ${sizes[i]}`;
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString();
  };

  return (
    <div className="flex flex-col gap-4 py-4">
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm">
          <FileText className="w-4 h-4 text-muted-foreground" />
          <span className="font-medium">File:</span>
          <span className="truncate">{fileInfo.name}</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <HardDrive className="w-4 h-4 text-muted-foreground" />
          <span className="font-medium">Size:</span>
          <span>{formatSize(fileInfo.size)}</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Clock className="w-4 h-4 text-muted-foreground" />
          <span className="font-medium">Last Modified:</span>
          <span>{formatDate(fileInfo.mtime)}</span>
        </div>
      </div>

      <div className="pt-2">
        <Button className="w-full gap-2">
          <Play className="w-4 h-4" />
          Initialize
        </Button>
        <p className="text-[10px] text-muted-foreground mt-2 text-center">
          AI will analyze the log structure and create database tables.
        </p>
      </div>
    </div>
  );
}
