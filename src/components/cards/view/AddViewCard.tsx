"use client";

import { Plus } from "lucide-react";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { AdminPasswordDialog } from "../../AdminPasswordDialog";
import { DashboardCard } from "../../DashboardCard";
import { AIChatStep } from "./steps/AIChatStep";
import { TableSelectionStep } from "./steps/TableSelectionStep";

type Step = "select-table" | "ai-chat";

interface AddViewCardProps {
  aiConfigured?: boolean;
}

export function AddViewCard({ aiConfigured = true }: AddViewCardProps) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>("select-table");
  const [selectedTables, setSelectedTables] = useState<string[]>([]);
  const { isDialogOpen, setIsDialogOpen, withAdminAuth, handleVerified } =
    useAdminAuth();

  const handleNext = () => {
    if (selectedTables.length === 0) return;
    setStep("ai-chat");
  };

  const handleClose = () => {
    setOpen(false);
    setStep("select-table");
    setSelectedTables([]);
  };

  const handleTriggerClick = () => {
    if (!aiConfigured) {
      alert("请先在右上角“设置”中配置 AI 后再添加视图");
      return;
    }
    withAdminAuth(() => setOpen(true));
  };

  return (
    <>
      <Dialog
        open={open}
        onOpenChange={(v) => {
          if (!v) handleClose();
          else handleTriggerClick();
        }}
      >
        <DialogTrigger asChild>
          <div className="cursor-pointer h-full">
            <DashboardCard
              title="添加视图"
              desc="从数据源中选择表格创建新的分析视图"
              colSpan={1}
              rowSpan={1}
            >
              <div className="flex flex-col items-center justify-center h-full border-2 border-dashed border-muted-foreground/20 rounded-lg hover:border-primary/50 transition-colors group/add">
                <Plus className="h-8 w-8 text-muted-foreground group-hover/add:text-primary transition-colors" />
                <span className="text-xs text-muted-foreground group-hover/add:text-primary">
                  点击添加
                </span>
              </div>
            </DashboardCard>
          </div>
        </DialogTrigger>

        <DialogContent className="sm:max-w-[600px] w-[95vw] h-[80vh] max-h-[700px] flex flex-col overflow-hidden">
          <DialogHeader className="flex-none">
            <DialogTitle>
              {step === "select-table" ? "选择数据表" : "AI 分析视图助手"}
            </DialogTitle>
            {step === "select-table" && (
              <p className="text-sm text-muted-foreground">
                请选择要分析的数据表（可多选，至少选择 1 个）
              </p>
            )}
          </DialogHeader>

          <div className="flex-1 overflow-hidden min-h-0">
            {step === "select-table" ? (
              <TableSelectionStep
                selectedTables={selectedTables}
                onSelect={setSelectedTables}
                onNext={handleNext}
                onCancel={handleClose}
              />
            ) : (
              <AIChatStep
                selectedTables={selectedTables}
                onBack={() => setStep("select-table")}
                onCancel={handleClose}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>

      <AdminPasswordDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onVerified={handleVerified}
      />
    </>
  );
}
