// src/components/shared/users/hooks/useCustomerMetricsModal.ts
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  openMetricsModal,
  closeMetricsModal,
  openHistoryModal,
  closeHistoryModal,
  openKeywordHistoryModal,
  closeKeywordHistoryModal,
} from "@/store/features/metrics/metricsSlice";
import { User } from "@/types/user";
import {
  useGetMetrics,
  useGetKeywords,
  useGetRecommendKeywords,
  useSaveMetrics,
  useAddKeyword,
  useUpdateKeyword,
  useDeleteKeyword,
  useAddRecommendKeyword,
  useDeleteRecommendKeyword,
  useGetCombinedHistory,
  useGetKeywordSpecificHistory,
} from "@/hooks/api/useCustomersApi";
import { showPromiseToast } from "../../toast/lib/toastify";
import {
  KeywordReport,
  KeywordReportForm,
  KeywordRecommendForm,
  OverallMetricsForm,
} from "@/types";

export const useCustomerMetricsModal = (users: User[]) => {
  const dispatch = useAppDispatch();
  // ดึงเฉพาะ UI State จาก Redux
  const {
    isMetricsModalOpen,
    selectedCustomerId,
    isHistoryModalOpen,
    isKeywordHistoryModalOpen,
    selectedKeyword,
  } = useAppSelector((state) => state.metrics);

  const selectedCustomer =
    users.find((u) => u.id === selectedCustomerId) || null;

  // --- ใช้ React Query Hooks ---
  const {
    data: metricsData,
    isLoading: isLoadingMetrics,
    error: errorMetrics,
  } = useGetMetrics(selectedCustomerId || "");

  const {
    data: keywordsData = [],
    isLoading: isLoadingKeywords,
    error: errorKeywords,
  } = useGetKeywords(selectedCustomerId || "");

  const {
    data: recommendKeywordsData = [],
    isLoading: isLoadingRecommend,
    error: errorRecommend,
  } = useGetRecommendKeywords(selectedCustomerId || "");

  const {
    data: combinedHistoryData,
    isFetching: isLoadingCombinedHistory,
    error: errorCombinedHistory,
    refetch: fetchCombinedHistory,
  } = useGetCombinedHistory(isHistoryModalOpen ? selectedCustomerId : null);

  const {
    data: specificKeywordHistoryData = [],
    isFetching: isLoadingSpecificHistory,
    error: errorSpecificHistory,
  } = useGetKeywordSpecificHistory(
    isKeywordHistoryModalOpen ? selectedKeyword?.id ?? null : null
  );

  // --- ใช้ React Query Mutations ---
  const saveMetricsMutation = useSaveMetrics();
  const addKeywordMutation = useAddKeyword();
  const updateKeywordMutation = useUpdateKeyword();
  const deleteKeywordMutation = useDeleteKeyword();
  const addRecommendKeywordMutation = useAddRecommendKeyword();
  const deleteRecommendKeywordMutation = useDeleteRecommendKeyword();

  // --- แก้ไข Handler Functions ---
  const handleOpenMetrics = (user: User) => {
    dispatch(openMetricsModal(user));
    // ไม่ต้อง dispatch(fetch...) แล้ว React Query จะ fetch เองเมื่อ selectedCustomerId เปลี่ยน
  };

  const handleCloseMetrics = () => dispatch(closeMetricsModal());

  const handleSaveMetrics = async (data: Partial<OverallMetricsForm>) => {
    if (!selectedCustomerId) return;
    const promise = saveMetricsMutation.mutateAsync({
      customerId: selectedCustomerId,
      metrics: data as OverallMetricsForm,
    });
    showPromiseToast(promise, {
      pending: "กำลังบันทึก Metrics...",
      success: "บันทึก Metrics สำเร็จ!",
      error: "ไม่สามารถบันทึก Metrics ได้",
    });
  };

  const handleAddKeyword = async (keyword: KeywordReportForm) => {
    if (!selectedCustomerId) return;
    const promise = addKeywordMutation.mutateAsync({
      customerId: selectedCustomerId,
      keyword: keyword,
    });
    showPromiseToast(promise, {
      pending: "กำลังเพิ่ม Keyword...",
      success: "เพิ่ม Keyword สำเร็จ!",
      error: "ไม่สามารถเพิ่ม Keyword ได้",
    });
  };

  const handleDeleteKeyword = async (keywordId: string) => {
    const promise = deleteKeywordMutation.mutateAsync(keywordId);
    showPromiseToast(promise, {
      pending: "กำลังลบ Keyword...",
      success: "ลบ Keyword สำเร็จ!",
      error: "ไม่สามารถลบ Keyword ได้",
    });
  };

  const handleUpdateKeyword = async (
    keywordId: string,
    data: KeywordReportForm
  ) => {
    const promise = updateKeywordMutation.mutateAsync({
      keywordId: keywordId,
      keyword: data,
    });
    showPromiseToast(promise, {
      pending: "กำลังอัปเดต Keyword...",
      success: "อัปเดต Keyword สำเร็จ!",
      error: "ไม่สามารถอัปเดต Keyword ได้",
    });
  };

  const handleAddRecommendKeyword = async (keyword: KeywordRecommendForm) => {
    if (!selectedCustomerId) return;
    const promise = addRecommendKeywordMutation.mutateAsync({
      customerId: selectedCustomerId,
      keyword: keyword,
    });
    showPromiseToast(promise, {
      pending: "กำลังเพิ่ม Recommend Keyword...",
      success: "เพิ่ม Recommend Keyword สำเร็จ!",
      error: "ไม่สามารถเพิ่ม Recommend Keyword ได้",
    });
  };

  const handleDeleteRecommendKeyword = async (recommendId: string) => {
    const promise = deleteRecommendKeywordMutation.mutateAsync(recommendId);
    showPromiseToast(promise, {
      pending: "กำลังลบ Recommend Keyword...",
      success: "ลบ Recommend Keyword สำเร็จ!",
      error: "ไม่สามารถลบ Recommend Keyword ได้",
    });
  };

  const handleOpenHistory = () => {
    dispatch(openHistoryModal());
    // ไม่ต้อง dispatch(fetch...) แล้ว
  };

  const handleCloseHistory = () => dispatch(closeHistoryModal());

  const handleOpenKeywordHistory = (keyword: KeywordReport) => {
    dispatch(openKeywordHistoryModal(keyword));
    // ไม่ต้อง dispatch(fetch...) แล้ว
  };

  const handleCloseKeywordHistory = () => dispatch(closeKeywordHistoryModal());

  // --- Return ค่า ---
  return {
    // State (จาก React Query และ Redux UI State)
    metrics: metricsData,
    keywords: keywordsData,
    recommendKeywords: recommendKeywordsData,
    keywordHistory: specificKeywordHistoryData,
    isMetricsModalOpen,
    selectedCustomer,
    isHistoryModalOpen,
    historyData: combinedHistoryData || {
      metricsHistory: [],
      keywordHistory: [],
    },
    isKeywordHistoryModalOpen,
    selectedKeyword,
    // Loading States (Optional: ส่งให้ Component จัดการ)
    isLoadingMetrics,
    isLoadingKeywords,
    isLoadingRecommend,
    isLoadingCombinedHistory,
    isLoadingSpecificHistory,
    // Actions/Handlers
    handleOpenMetrics,
    handleCloseMetrics,
    handleSaveMetrics,
    handleAddKeyword,
    handleDeleteKeyword,
    handleUpdateKeyword,
    handleAddRecommendKeyword,
    handleDeleteRecommendKeyword,
    handleOpenHistory,
    handleCloseHistory,
    handleOpenKeywordHistory,
    handleCloseKeywordHistory,
  };
};
