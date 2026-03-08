"use client";

import { Brain, ChevronDown, ChevronRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface ThinkingProcessProps {
  text: string;
  state?: "streaming" | "done";
}

export function ThinkingProcess({ text, state }: ThinkingProcessProps) {
  const isStreaming = state === "streaming";
  const [isCollapsed, setIsCollapsed] = useState(!isStreaming);
  const prevIsStreaming = useRef(isStreaming);

  useEffect(() => {
    // If it transitions from streaming to finished, collapse it
    if (prevIsStreaming.current && !isStreaming) {
      setIsCollapsed(true);
    }
    // If it is streaming, make sure it is expanded
    if (isStreaming) {
      setIsCollapsed(false);
    }
    prevIsStreaming.current = isStreaming;
  }, [isStreaming]);

  if (!text) return null;

  return (
    <div className="my-2 border-l-2 border-muted pl-3 py-1">
      <button
        type="button"
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="flex items-center gap-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors group"
      >
        <div className="flex items-center gap-1.5">
          <Brain className="h-3 w-3" />
          <span>思考过程</span>
          {isStreaming && (
            <span className="flex h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
          )}
        </div>
        {isCollapsed ? (
          <ChevronRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
        ) : (
          <ChevronDown className="h-3 w-3" />
        )}
      </button>

      {!isCollapsed && (
        <div className="mt-2 text-xs text-muted-foreground italic whitespace-pre-wrap leading-relaxed animate-in fade-in slide-in-from-top-1 duration-200">
          {text}
        </div>
      )}
    </div>
  );
}
