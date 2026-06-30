"use client";

import { Loader2 } from "lucide-react";
import { useState } from "react";
import { verifyAdminPassword } from "@/app/actions/auth";
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

interface AdminPasswordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onVerified: (password: string) => void;
}

export function AdminPasswordDialog({
  open,
  onOpenChange,
  onVerified,
}: AdminPasswordDialogProps) {
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleVerify = async () => {
    if (!password) return;
    setIsLoading(true);
    setError(null);
    try {
      const result = await verifyAdminPassword(password);
      if (result.success) {
        onVerified(password);
        onOpenChange(false);
      } else {
        setError(result.error || "密码验证失败");
      }
    } catch (_e) {
      setError("验证过程中发生错误");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>需要管理员权限</DialogTitle>
          <DialogDescription>
            此操作需要管理员权限。请输入管理员密码以继续。
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Input
            type="password"
            placeholder="管理员密码"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleVerify();
            }}
            autoFocus
          />
          {error && (
            <p className="text-sm text-destructive font-medium">{error}</p>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button onClick={handleVerify} disabled={isLoading || !password}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            验证
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
