// src/components/Customer/Report/hooks/useReportPage.ts
import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchReportData } from "@/store/features/metrics/metricsSlice";

/**
 * Custom Hook สำหรับจัดการ State และ Logic ของ ReportPage
 * @param customerId - ID ของลูกค้า
 * @returns State ที่เกี่ยวข้องกับ Report (reportData, reportStatus, error)
 */
export const useReportPage = (customerId: string) => {
  const dispatch = useAppDispatch();
  const { reportData, reportStatus, error } = useAppSelector(
    (state) => state.metrics
  );

  // ดึงข้อมูล Report เมื่อ customerId เปลี่ยน
  useEffect(() => {
    if (customerId) {
      dispatch(fetchReportData(customerId));
    }
  }, [customerId, dispatch]);

  return {
    reportData,
    reportStatus,
    error,
  };
};
