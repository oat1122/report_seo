// src/components/Customer/Report/hooks/useOverallMetricsCard.ts
import { useState } from "react";
import { useGetCombinedHistory } from "@/hooks/api/useCustomersApi";

/**
 * Custom Hook for OverallMetricsCard State and History Modal Logic (using React Query)
 * @param customerId - ID of the customer
 * @returns State and functions for History Modal
 */
export const useOverallMetricsCard = (customerId: string) => {
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  // ใช้ useQuery เพื่อดึงข้อมูล แต่ disable ไว้ก่อน
  const {
    data: historyData,
    isFetching: isHistoryLoading, // ใช้ isFetching เพราะเราจะ trigger ทีหลัง
    error: historyError,
  } = useGetCombinedHistory(isHistoryModalOpen ? customerId : null); // Enable query เมื่อ Modal เปิด

  const handleOpenHistoryModal = () => {
    setIsHistoryModalOpen(true);
  };

  const handleCloseHistoryModal = () => {
    setIsHistoryModalOpen(false);
  };

  return {
    isHistoryModalOpen,
    // ส่งข้อมูล, loading, error จาก React Query
    historyData: historyData || { metricsHistory: [], keywordHistory: [] }, // Provide default empty state
    isHistoryLoading,
    historyError,
    handleOpenHistoryModal,
    handleCloseHistoryModal,
  };
};
