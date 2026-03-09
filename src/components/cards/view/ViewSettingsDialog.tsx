"use client";

import { useState } from "react";
import { updateView } from "@/app/actions/view";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

interface View {
  id: number;
  title: string;
  description?: string;
  query_sql: string;
  viz_config: string;
  layout_w: number;
  layout_h: number;
  layout_order: number;
}

interface ViewSettingsDialogProps {
  view: View;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (updatedView: View) => void;
}

export function ViewSettingsDialog({
  view,
  open,
  onOpenChange,
  onSuccess,
}: ViewSettingsDialogProps) {
  const [title, setTitle] = useState(view.title);
  const [description, setDescription] = useState(view.description || "");
  const [layoutW, setLayoutW] = useState(view.layout_w.toString());
  const [layoutH, setLayoutH] = useState(view.layout_h.toString());
  const [layoutOrder, setLayoutOrder] = useState(view.layout_order.toString());
  const [querySql, setQuerySql] = useState(view.query_sql);
  const [vizConfig, setVizConfig] = useState(view.viz_config);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const updateData = {
        title,
        description,
        query_sql: querySql,
        viz_config: vizConfig,
        layout_w: parseInt(layoutW, 10),
        layout_h: parseInt(layoutH, 10),
        layout_order: parseInt(layoutOrder, 10),
      };

      const result = await updateView(view.id, updateData);

      if (result.success) {
        onSuccess({
          ...view,
          ...updateData,
        });
        onOpenChange(false);
      } else {
        alert(result.error || "更新视图失败");
      }
    } catch (_e) {
      alert("更新视图时出错");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>视图设置</DialogTitle>
          <DialogDescription>
            修改视图的所有参数，包括标题、描述、布局以及底层的 SQL
            和可视化配置。
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">标题</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="输入视图标题"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">描述</Label>
              <Input
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="输入视图描述（可选）"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="layout_w">宽度 (列)</Label>
              <Select value={layoutW} onValueChange={setLayoutW}>
                <SelectTrigger id="layout_w">
                  <SelectValue placeholder="选择宽度" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 列</SelectItem>
                  <SelectItem value="2">2 列</SelectItem>
                  <SelectItem value="3">3 列</SelectItem>
                  <SelectItem value="4">4 列</SelectItem>
                  <SelectItem value="5">5 列</SelectItem>
                  <SelectItem value="6">6 列</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="layout_h">高度 (行)</Label>
              <Select value={layoutH} onValueChange={setLayoutH}>
                <SelectTrigger id="layout_h">
                  <SelectValue placeholder="选择高度" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 行</SelectItem>
                  <SelectItem value="2">2 行</SelectItem>
                  <SelectItem value="3">3 行</SelectItem>
                  <SelectItem value="4">4 行</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="layout_order">排序权重</Label>
              <Input
                id="layout_order"
                type="number"
                value={layoutOrder}
                onChange={(e) => setLayoutOrder(e.target.value)}
                placeholder="数字越大越靠后"
              />
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t">
            <Label htmlFor="query_sql" className="font-semibold">
              SQL 查询
            </Label>
            <Textarea
              id="query_sql"
              value={querySql}
              onChange={(e) => setQuerySql(e.target.value)}
              placeholder="输入 SQL 查询语句"
              className="font-mono text-xs min-h-[120px]"
              required
            />
          </div>

          <div className="space-y-2 pt-2">
            <Label htmlFor="viz_config" className="font-semibold">
              可视化配置 (Vega-Lite JSON)
            </Label>
            <Textarea
              id="viz_config"
              value={vizConfig}
              onChange={(e) => setVizConfig(e.target.value)}
              placeholder="输入 Vega-Lite 配置 JSON"
              className="font-mono text-xs min-h-[200px]"
              required
            />
          </div>

          <DialogFooter className="pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              取消
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "保存中..." : "保存更改"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
