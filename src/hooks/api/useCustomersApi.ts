// Shim — re-export hooks from feature presentation
// Phase 6 จะอัปเดต component ให้ import จาก @/features/<x>/presentation/hooks ตรง แล้วลบไฟล์นี้
export {
  useGetCustomerReport,
  useGetCombinedHistory,
  type CustomerReportData,
  type CurrentKeyword,
  type CombinedHistoryData,
} from "@/features/customer-report/presentation/hooks/useCustomerReport";

export {
  useSaveMetrics,
  useToggleMetricsHistoryVisibility,
} from "@/features/metrics/presentation/hooks/useMetrics";

export {
  useGetKeywords,
  useAddKeyword,
  useUpdateKeyword,
  useDeleteKeyword,
  useGetKeywordSpecificHistory,
  useToggleKeywordHistoryVisibility,
} from "@/features/keywords/presentation/hooks/useKeywords";

export {
  useGetRecommendKeywords,
  useAddRecommendKeyword,
  useUpdateRecommendKeyword,
  useDeleteRecommendKeyword,
} from "@/features/recommendations/presentation/hooks/useRecommendations";

export {
  useGetAiOverviews,
  useAddAiOverview,
  useUpdateAiOverview,
  useDeleteAiOverview,
} from "@/features/ai-overview/presentation/hooks/useAiOverviews";
