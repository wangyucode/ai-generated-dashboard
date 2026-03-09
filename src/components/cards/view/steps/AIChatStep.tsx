"use client";

import { useChat } from "@ai-sdk/react";
import {
  AlertCircle,
  ChevronLeft,
  Loader2,
  Send,
  Sparkles,
  Square,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { saveView } from "@/app/actions/view";
import { Markdown } from "@/components/Markdown";
import { GenerateViewPreview } from "@/components/messages/GenerateViewPreview";
import { RunSqlMessage } from "@/components/messages/RunSqlMessage";
import { ThinkingProcess } from "@/components/messages/ThinkingProcess";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useDataSourceStore } from "@/store/useDataSourceStore";

interface AIChatStepProps {
  selectedTables: string[];
  onBack: () => void;
  onCancel: () => void;
}

export interface GenerateViewArgs {
  toolCallId: string;
  title: string;
  description?: string;
  query_sql: string;
  viz_config: string;
  layout_w: number;
  layout_h: number;
  layout_order?: number;
}

export function AIChatStep({
  selectedTables,
  onBack,
  onCancel,
}: AIChatStepProps) {
  const { currentDataSource } = useDataSourceStore();
  const [input, setInput] = useState("你来推荐适合这几个表的可视化方案");
  const [isSaving, setIsSaving] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { messages, sendMessage, status, error, stop } = useChat();

  const isLoading = status === "submitted" || status === "streaming";

  // Scroll to bottom when messages change
  // biome-ignore lint/correctness/useExhaustiveDependencies: trigger on messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, status]);

  const handleFormSubmit = (e: React.SubmitEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    sendMessage(
      { text: input },
      {
        body: {
          selectedTables,
          dbType: currentDataSource?.type,
          connection_info: currentDataSource?.connection_info,
        },
      },
    );
    setInput("");
  };

  const handleSaveView = async (
    _toolCallId: string,
    viewData: GenerateViewArgs,
  ) => {
    if (!currentDataSource) return;
    setIsSaving(true);
    try {
      const result = await saveView({
        data_source_id: currentDataSource.id,
        title: viewData.title,
        description: viewData.description,
        query_sql: viewData.query_sql,
        viz_config: viewData.viz_config,
        layout_w: viewData.layout_w,
        layout_h: viewData.layout_h,
        layout_order: viewData.layout_order,
      });

      if (result.success) {
        onCancel(); // Close the dialog on success
        // You might want to refresh the view list here, but since it's a server action + revalidatePath (not yet added), we just close for now.
        window.location.reload(); // Simple way to refresh
      } else {
        alert(result.error || "保存失败");
      }
    } catch (err) {
      console.error("Failed to save view:", err);
      alert("保存出错");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col h-full w-full max-w-full overflow-hidden">
      <div className="mb-4">
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-sm font-medium text-muted-foreground mr-1">
            已选表格:
          </span>
          {selectedTables.map((table) => (
            <div
              key={table}
              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20"
            >
              {table}
            </div>
          ))}
          {selectedTables.length === 0 && (
            <span className="text-sm text-muted-foreground italic">
              未选择表格
            </span>
          )}
        </div>
      </div>
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 space-y-4 border rounded-lg bg-muted/30">
        {messages.length === 0 && (
          <div className="text-center text-muted-foreground py-8 text-sm">
            <Sparkles className="h-8 w-8 mx-auto mb-2 opacity-20" />
            <p>
              你好！我是 AI
              数据分析师，直接说出你关于选择表格的可视化需求，我会直接帮你生成对应的可视化图表。
            </p>
          </div>
        )}
        {messages.map((m) => {
          return (
            <div
              key={m.id}
              className={cn(
                "flex w-full flex-col gap-2 rounded-lg px-3 py-2 text-sm break-words",
                m.role === "user"
                  ? "ml-auto max-w-[85%] bg-primary text-primary-foreground"
                  : "bg-background border shadow-sm max-w-[95%]",
              )}
            >
              <div className="flex items-center gap-2">
                {m.role === "assistant" && (
                  <Sparkles className="h-3 w-3 text-primary" />
                )}
                <span className="font-semibold">
                  {m.role === "user" ? "你" : "AI 助手"}
                </span>
              </div>
              <div className="leading-relaxed">
                {m.parts.map((part, index) => {
                  if (part.type === "reasoning") {
                    return (
                      <ThinkingProcess
                        key={`${m.id}-part-${index}`}
                        text={part.text}
                        state={part.state}
                      />
                    );
                  } else if (part.type === "text") {
                    return (
                      <Markdown
                        key={`${m.id}-part-${index}`}
                        content={part.text}
                        role={m.role}
                      />
                    );
                  } else if (part.type === "tool-generateView") {
                    return (
                      <GenerateViewPreview
                        key={`${m.id}-part-${index}`}
                        part={part}
                        messageId={m.id}
                        index={index}
                        onSave={handleSaveView}
                        isSaving={isSaving}
                      />
                    );
                  } else if (part.type === "tool-runSql") {
                    return (
                      <RunSqlMessage
                        key={`${m.id}-part-${index}`}
                        part={part}
                        messageId={m.id}
                        index={index}
                      />
                    );
                  }
                  return null;
                })}
                {m.role === "assistant" && m.parts.length === 0 && (
                  <Loader2 className="h-4 w-4 animate-spin" />
                )}
              </div>
            </div>
          );
        })}
        {error && (
          <div className="flex items-center gap-2 p-3 text-sm text-destructive bg-destructive/10 rounded-lg border border-destructive/20">
            <AlertCircle className="h-4 w-4" />
            <span>对话出错了，请稍后重试。</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <form
        onSubmit={(e) => {
          if (isLoading) {
            e.preventDefault();
            stop();
            return;
          }
          handleFormSubmit(e);
        }}
        className="mt-4 flex gap-2"
      >
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={onBack}
          disabled={isLoading}
          title="返回上一步"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Input
          value={input}
          placeholder={isLoading ? "AI 正在思考..." : "输入您的问题..."}
          onChange={(e) => setInput(e.target.value)}
          disabled={isLoading}
          className="flex-1"
        />
        <Button
          type="submit"
          variant={isLoading ? "destructive" : "default"}
          disabled={!isLoading && !input.trim()}
          title={isLoading ? "停止生成" : "发送消息"}
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <Square className="h-3 w-3 fill-current" />
            </div>
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      </form>
    </div>
  );
}
