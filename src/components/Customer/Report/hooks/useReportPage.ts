// src/components/Customer/Report/hooks/useReportPage.ts
import { useGetCustomerReport } from "@/hooks/api/useCustomersApi";

/**
 * Custom Hook for ReportPage using React Query
 * @param customerId - ID of the customer
 * @returns React Query state for the customer report
 */
export const useReportPage = (customerId: string) => {
  // เรียกใช้ React Query Hook โดยตรง
  const {
    data: reportData,
    isLoading, // ใช้ isLoading สำหรับ Initial Load
    isFetching, // ใช้ isFetching สำหรับ Background Refetch
    error,
    status, // 'loading', 'error', 'success'
  } = useGetCustomerReport(customerId);

  // Return ค่าจาก React Query โดยตรง
  return {
    reportData,
    isLoading, // ส่ง isLoading ให้ Component ใช้
    isFetching,
    error: error ? (error as Error).message : null, // จัดการรูปแบบ error
    reportStatus: status, // ส่ง status ให้ Component (เผื่ออยากใช้)
  };
};
