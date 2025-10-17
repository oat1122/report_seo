// src/components/Customer/Report/hooks/useOverallMetricsCard.ts
import { useState } from "react";
import axios from "@/lib/axios";
import { showPromiseToast } from "@/components/shared/toast/lib/toastify";
import { OverallMetricsHistory, KeywordReportHistory } from "@/types/history";

interface HistoryData {
  metricsHistory: OverallMetricsHistory[];
  keywordHistory: KeywordReportHistory[];
}

/**
 * Custom Hook สำหรับจัดการ State และ Logic ของ OverallMetricsCard
 * @param customerId - ID ของลูกค้า
 * @returns State และฟังก์ชันสำหรับจัดการ History Modal
 */
export const useOverallMetricsCard = (customerId: string) => {
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [historyData, setHistoryData] = useState<HistoryData>({
    metricsHistory: [],
    keywordHistory: [],
  });

  /**
   * ฟังก์ชันเปิด Modal และดึงข้อมูลประวัติ
   */
  const handleOpenHistoryModal = async () => {
    try {
      const response = await axios.get(
        `/customers/${customerId}/metrics/history`
      );
      setHistoryData(response.data);
      setIsHistoryModalOpen(true);
    } catch (err) {
      console.error("Failed to fetch metrics history", err);
      showPromiseToast(Promise.reject(err), {
        pending: "",
        success: "",
        error: "ไม่สามารถโหลดข้อมูลประวัติได้",
      });
    }
  };

  /**
   * ฟังก์ชันปิด Modal และรีเซ็ตข้อมูล
   */
  const handleCloseHistoryModal = () => {
    setIsHistoryModalOpen(false);
    setHistoryData({ metricsHistory: [], keywordHistory: [] });
  };

  return {
    isHistoryModalOpen,
    historyData,
    handleOpenHistoryModal,
    handleCloseHistoryModal,
  };
};
