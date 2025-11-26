// src/components/Customer/Report/contexts/HistoryContext.tsx
"use client";

import React, { createContext, useContext, ReactNode } from "react";
import {
  useGetCombinedHistory,
  CurrentKeyword,
} from "@/hooks/api/useCustomersApi";
import { OverallMetricsHistory, KeywordReportHistory } from "@/types/history";

// --- Types ---
interface HistoryContextValue {
  metricsHistory: OverallMetricsHistory[];
  keywordHistory: KeywordReportHistory[];
  currentKeywords: CurrentKeyword[]; // Keywords ปัจจุบัน (เรียงตาม traffic)
  isLoading: boolean;
  error: Error | null;
}

interface HistoryProviderProps {
  customerId: string;
  children: ReactNode;
}

// --- Context ---
const HistoryContext = createContext<HistoryContextValue | undefined>(
  undefined
);

// --- Provider Component ---
export const HistoryProvider: React.FC<HistoryProviderProps> = ({
  customerId,
  children,
}) => {
  // Fetch combined history with 5-minute cache
  const { data, isLoading, error } = useGetCombinedHistory(customerId);

  const value: HistoryContextValue = {
    metricsHistory: data?.metricsHistory || [],
    keywordHistory: data?.keywordHistory || [],
    currentKeywords: data?.currentKeywords || [],
    isLoading,
    error: error as Error | null,
  };

  return (
    <HistoryContext.Provider value={value}>{children}</HistoryContext.Provider>
  );
};

// --- Custom Hook ---
export const useHistoryContext = (): HistoryContextValue => {
  const context = useContext(HistoryContext);
  if (context === undefined) {
    throw new Error("useHistoryContext must be used within a HistoryProvider");
  }
  return context;
};
