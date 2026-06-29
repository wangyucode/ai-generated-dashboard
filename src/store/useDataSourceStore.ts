import { create } from "zustand";
import type { AIConfig } from "@/app/actions/aiConfig";
import type { DataSource } from "@/types/database";

interface DataSourceState {
  currentDataSource: DataSource | null;
  aiConfig: AIConfig | null;
  setCurrentDataSource: (ds: DataSource | null) => void;
  setAIConfig: (config: AIConfig | null) => void;
}

export const useDataSourceStore = create<DataSourceState>((set) => ({
  currentDataSource: null,
  aiConfig: null,
  setCurrentDataSource: (ds) => set({ currentDataSource: ds }),
  setAIConfig: (config) => set({ aiConfig: config }),
}));
