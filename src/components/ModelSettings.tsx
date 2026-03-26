"use client";

import { Settings } from "lucide-react";
import { useState } from "react";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { AdminPasswordDialog } from "./AdminPasswordDialog";
import { SettingsDialog } from "./SettingsDialog";

export function ModelSettings() {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const { isDialogOpen, setIsDialogOpen, withAdminAuth, handleVerified } =
    useAdminAuth();

  return (
    <>
      <button
        onClick={() => withAdminAuth(() => setSettingsOpen(true))}
        className="rounded-md p-2 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors"
      >
        <Settings className="h-4 w-4" />
      </button>
      <SettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} />
      <AdminPasswordDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onVerified={handleVerified}
      />
    </>
  );
}
