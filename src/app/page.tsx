"use client";

import { DashboardCard } from "@/components/DashboardCard";
import { useLogStore } from "@/store/useLogStore";

export default function Home() {
  const { isLoading, selectedLog } = useLogStore();

  const showNotFound = !isLoading && !selectedLog;

  return (
    <main className="container mx-auto p-4 md:p-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 md:gap-6 auto-rows-auto">
      {showNotFound && (
        <DashboardCard
          title="Log file not found."
          desc="please mount log files to app/logs"
        >
          {null}
        </DashboardCard>
      )}
    </main>
  );
}
