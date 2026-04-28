// src/components/Customer/Report/hooks/useReportPage.ts
"use client";

import {
  CustomerReportData,
  useGetCustomerReport,
} from "@/hooks/api/useCustomersApi";

export const useReportPage = (
  customerId: string,
  initialData?: CustomerReportData,
) => {
  const {
    data: reportData,
    isLoading,
    isFetching,
    error,
    status,
  } = useGetCustomerReport(customerId, initialData);

  return {
    reportData,
    isLoading,
    isFetching,
    error: error ? (error as Error).message : null,
    reportStatus: status,
  };
};
