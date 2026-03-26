"use client";

import { Settings } from "lucide-react";
import { useState } from "react";
import { SettingsDialog } from "./SettingsDialog";

export function ModelSettings() {
  const [settingsOpen, setSettingsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setSettingsOpen(true)}
        className="rounded-md p-2 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors"
      >
        <Settings className="h-4 w-4" />
      </button>
      <SettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} />
    </>
  );
}
