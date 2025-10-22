// src/components/shared/users/hooks/useCustomerMetricsModal.ts
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  saveMetrics,
  addKeyword,
  deleteKeyword,
  updateKeyword,
  addRecommendKeyword,
  deleteRecommendKeyword,
  fetchKeywordHistory,
  openMetricsModal,
  closeMetricsModal,
  openHistoryModal,
  closeHistoryModal,
  openKeywordHistoryModal,
  closeKeywordHistoryModal,
  fetchHistoryData,
  fetchMetrics,
  fetchKeywords,
  fetchRecommendKeywords,
} from "@/store/features/metrics/metricsSlice";
import { User } from "@/types/user";
import { showPromiseToast } from "../../toast/lib/toastify";
import {
  KeywordReport,
  KeywordReportForm,
  KeywordRecommendForm,
  OverallMetrics,
  OverallMetricsForm,
} from "@/types";

export const useCustomerMetricsModal = (users: User[]) => {
  const dispatch = useAppDispatch();
  const {
    metrics,
    keywords,
    recommendKeywords,
    keywordHistory,
    isMetricsModalOpen,
    selectedCustomerId,
    isHistoryModalOpen,
    historyData,
    isKeywordHistoryModalOpen,
    selectedKeyword,
  } = useAppSelector((state) => state.metrics);

  const selectedCustomer =
    users.find((u) => u.id === selectedCustomerId) || null;

  const handleOpenMetrics = (user: User) => {
    dispatch(openMetricsModal(user));
    const promise = Promise.all([
      dispatch(fetchMetrics(user.id)).unwrap(),
      dispatch(fetchKeywords(user.id)).unwrap(),
      dispatch(fetchRecommendKeywords(user.id)).unwrap(),
    ]);
    showPromiseToast(promise, {
      pending: "กำลังโหลดข้อมูลลูกค้า...",
      success: "โหลดข้อมูลสำเร็จ!",
      error: "ไม่สามารถโหลดข้อมูลได้",
    });
  };

  const handleCloseMetrics = () => dispatch(closeMetricsModal());

  const handleSaveMetrics = async (data: Partial<OverallMetrics>) => {
    if (!selectedCustomerId) return;
    const promise = dispatch(
      saveMetrics({
        customerId: selectedCustomerId,
        data: data as OverallMetricsForm,
      })
    ).unwrap();
    showPromiseToast(promise, {
      pending: "กำลังบันทึก Metrics...",
      success: "บันทึก Metrics สำเร็จ!",
      error: "ไม่สามารถบันทึก Metrics ได้",
    });
  };

  const handleAddKeyword = async (keyword: KeywordReportForm) => {
    if (!selectedCustomerId) return;
    const promise = dispatch(
      addKeyword({ customerId: selectedCustomerId, data: keyword })
    ).unwrap();
    showPromiseToast(promise, {
      pending: "กำลังเพิ่ม Keyword...",
      success: "เพิ่ม Keyword สำเร็จ!",
      error: "ไม่สามารถเพิ่ม Keyword ได้",
    });
  };

  const handleDeleteKeyword = async (keywordId: string) => {
    const promise = dispatch(deleteKeyword(keywordId)).unwrap();
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
    const promise = dispatch(updateKeyword({ keywordId, data })).unwrap();
    showPromiseToast(promise, {
      pending: "กำลังอัปเดต Keyword...",
      success: "อัปเดต Keyword สำเร็จ!",
      error: "ไม่สามารถอัปเดต Keyword ได้",
    });
  };

  const handleAddRecommendKeyword = async (keyword: KeywordRecommendForm) => {
    if (!selectedCustomerId) return;
    const promise = dispatch(
      addRecommendKeyword({ customerId: selectedCustomerId, data: keyword })
    ).unwrap();
    showPromiseToast(promise, {
      pending: "กำลังเพิ่ม Recommend Keyword...",
      success: "เพิ่ม Recommend Keyword สำเร็จ!",
      error: "ไม่สามารถเพิ่ม Recommend Keyword ได้",
    });
  };

  const handleDeleteRecommendKeyword = async (recommendId: string) => {
    const promise = dispatch(deleteRecommendKeyword(recommendId)).unwrap();
    showPromiseToast(promise, {
      pending: "กำลังลบ Recommend Keyword...",
      success: "ลบ Recommend Keyword สำเร็จ!",
      error: "ไม่สามารถลบ Recommend Keyword ได้",
    });
  };

  const handleOpenHistory = () => {
    if (!selectedCustomerId) return;
    const promise = dispatch(fetchHistoryData(selectedCustomerId)).unwrap();
    showPromiseToast(promise, {
      pending: "กำลังโหลดประวัติ...",
      success: "โหลดประวัติสำเร็จ!",
      error: "ไม่สามารถโหลดประวัติได้",
    });
  };

  const handleCloseHistory = () => dispatch(closeHistoryModal());

  const handleOpenKeywordHistory = (keyword: KeywordReport) => {
    dispatch(openKeywordHistoryModal(keyword));
    const promise = dispatch(fetchKeywordHistory(keyword.id)).unwrap();
    showPromiseToast(promise, {
      pending: "กำลังโหลดประวัติ Keyword...",
      success: "โหลดประวัติ Keyword สำเร็จ!",
      error: "ไม่สามารถโหลดประวัติ Keyword ได้",
    });
  };

  const handleCloseKeywordHistory = () => dispatch(closeKeywordHistoryModal());

  return {
    // State
    metrics,
    keywords,
    recommendKeywords,
    keywordHistory,
    isMetricsModalOpen,
    selectedCustomer,
    isHistoryModalOpen,
    historyData,
    isKeywordHistoryModalOpen,
    selectedKeyword,
    // Actions
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
