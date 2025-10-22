// src/components/Customer/Report/hooks/useOverallMetricsCard.ts
import { useState } from "react";
import { useGetCombinedHistory } from "@/hooks/api/useCustomersApi";
import { OverallMetricsHistory, KeywordReportHistory } from "@/types/history";

interface HistoryData {
  metricsHistory: OverallMetricsHistory[];
  keywordHistory: KeywordReportHistory[];
}

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
    refetch: fetchHistory, // ฟังก์ชันสำหรับสั่งให้ query ทำงาน
  } = useGetCombinedHistory(isHistoryModalOpen ? customerId : null); // Enable query เมื่อ Modal เปิด

  const handleOpenHistoryModal = async () => {
    setIsHistoryModalOpen(true);
    // ไม่ต้อง fetch เองแล้ว React Query จะทำเมื่อ enabled: true
    // (อาจจะเรียก refetch() ถ้าต้องการโหลดใหม่ทุกครั้งที่เปิด)
    // await fetchHistory(); // <--- Optional: ถ้าอยากให้โหลดใหม่ทุกครั้งที่เปิด
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
