"use client";

import { FileText, Loader2, RefreshCw, Terminal } from "lucide-react";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useLogStore } from "@/store/useLogStore";

export function Navbar() {
  const { logFiles, selectedLog, setSelectedLog, fetchLogFiles, isLoading } =
    useLogStore();

  useEffect(() => {
    fetchLogFiles();
  }, [fetchLogFiles]);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white dark:bg-black/80 backdrop-blur-md">
      <div className="container mx-auto flex h-14 items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <Terminal className="h-6 w-6 text-blue-600" />
          <span className="text-lg font-bold tracking-tight">
            AI Log Analyzer
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-muted-foreground hidden sm:inline-block">
            Current Log:
          </span>
          <div className="flex items-center gap-2">
            <Select
              value={selectedLog || ""}
              onValueChange={(value) => setSelectedLog(value || null)}
              disabled={isLoading}
            >
              <SelectTrigger className="w-48 bg-transparent">
                <SelectValue
                  placeholder={
                    isLoading ? "Scanning logs..." : "Select a log file"
                  }
                >
                  {selectedLog ? (
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-blue-500" />
                      <span className="truncate">{selectedLog}</span>
                    </div>
                  ) : null}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {logFiles.length === 0 ? (
                  <div className="p-2 text-sm text-muted-foreground text-center">
                    No logs found in /logs
                  </div>
                ) : (
                  logFiles.map((file) => (
                    <SelectItem key={file.name} value={file.name}>
                      <div className="flex flex-col">
                        <span className="font-medium">{file.name}</span>
                        <span className="text-[10px] text-muted-foreground">
                          {(file.size / 1024).toFixed(2)} KB
                        </span>
                      </div>
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => fetchLogFiles()}
              disabled={isLoading}
              className="h-9 w-9"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
