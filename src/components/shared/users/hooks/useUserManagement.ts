import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchUsers, fetchSeoDevs } from "@/store/features/users/usersSlice";
import {
  fetchMetrics,
  fetchKeywords,
  fetchRecommendKeywords,
  clearMetricsState,
} from "@/store/features/metrics/metricsSlice";
import { User } from "@/types/user";
import { showPromiseToast } from "@/components/shared/toast/lib/toastify";

export const useUserManagement = () => {
  const dispatch = useAppDispatch();

  // ดึง State ทั้งหมดที่จำเป็นจาก Redux store
  const {
    users,
    seoDevs,
    status,
    error: usersError,
    isModalOpen,
    isEditing,
    currentUser,
    confirmState,
  } = useAppSelector((state) => state.users);

  const { metrics, keywords, recommendKeywords, keywordHistory } =
    useAppSelector((state) => state.metrics);

  // ดึงข้อมูลเริ่มต้นเพียงครั้งเดียว
  useEffect(() => {
    if (status === "idle") {
      dispatch(fetchUsers());
      dispatch(fetchSeoDevs());
    }
  }, [status, dispatch]);

  // Handler สำหรับการเปิด Metrics Modal
  const handleOpenMetricsModal = (customer: User) => {
    const promise = Promise.all([
      dispatch(fetchMetrics(customer.id)).unwrap(),
      dispatch(fetchKeywords(customer.id)).unwrap(),
      dispatch(fetchRecommendKeywords(customer.id)).unwrap(),
    ]);
    showPromiseToast(promise, {
      pending: "กำลังโหลดข้อมูลลูกค้า...",
      success: "โหลดข้อมูลสำเร็จ!",
      error: "ไม่สามารถโหลดข้อมูลได้",
    });
  };

  const handleCloseMetricsModal = () => {
    dispatch(clearMetricsState());
  };

  return {
    // State from Redux
    users,
    seoDevs,
    status,
    usersError,
    isModalOpen,
    isEditing,
    currentUser,
    confirmState,
    metrics,
    keywords,
    recommendKeywords,
    keywordHistory,
    // Handlers
    handleOpenMetricsModal,
    handleCloseMetricsModal,
  };
};
