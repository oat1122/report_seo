// src/components/shared/users/hooks/useUserManagementPage.ts
import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchUsers,
  fetchSeoDevs,
  openUserModal,
  closeUserModal,
  setCurrentUser,
  hideConfirmation,
  clearUserError,
  addUser,
  updateUser,
  deleteUser,
  restoreUser,
  updatePassword,
  showConfirmation,
} from "@/store/features/users/usersSlice";
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
import { Role } from "@/types/auth";
import axios from "@/lib/axios";
import { toast } from "react-toastify";

export const useUserManagementPage = () => {
  const dispatch = useAppDispatch();

  // Select all necessary states from Redux
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

  // --- useEffect เพื่อดึงข้อมูลผู้ใช้ตอนเริ่มต้น ---
  useEffect(() => {
    // ดึงข้อมูลเฉพาะเมื่อ status เป็น 'idle' เพื่อป้องกันการดึงซ้ำ
    if (status === "idle") {
      dispatch(fetchUsers());
      dispatch(fetchSeoDevs());
    }
  }, [status, dispatch]);

  // --- Handlers from UserManagement ---
  const handleOpenUserModal = async (user?: User) => {
    if (user && user.role === Role.CUSTOMER) {
      try {
        const response = await axios.get(`/users/${user.id}`);
        dispatch(openUserModal({ ...response.data } as User));
      } catch (err) {
        console.error("Failed to fetch customer data:", err);
        dispatch(openUserModal(user));
      }
    } else {
      dispatch(openUserModal(user));
    }
  };

  const handleCloseUserModal = () => {
    dispatch(closeUserModal());
  };

  const handleSaveUser = async () => {
    if (!currentUser) return;
    // Remove password-related fields from user update
    const infoToUpdate = { ...currentUser };
    delete infoToUpdate.newPassword;
    delete infoToUpdate.confirmPassword;
    delete infoToUpdate.currentPassword;

    const action = isEditing ? updateUser(infoToUpdate) : addUser(infoToUpdate);
    const promise = dispatch(action).unwrap();

    showPromiseToast(promise, {
      pending: "กำลังบันทึกข้อมูล...",
      success: isEditing ? "อัปเดตผู้ใช้สำเร็จ!" : "เพิ่มผู้ใช้สำเร็จ!",
      error: "เกิดข้อผิดพลาดในการบันทึก",
    });
  };

  const handlePasswordUpdate = () => {
    if (!currentUser || !currentUser.id || !currentUser.newPassword) return;

    if (currentUser.newPassword !== currentUser.confirmPassword) {
      toast.error("รหัสผ่านไม่ตรงกัน");
      return;
    }

    const promise = dispatch(
      updatePassword({ userId: currentUser.id, values: currentUser })
    ).unwrap();

    showPromiseToast(promise, {
      pending: "กำลังอัปเดตรหัสผ่าน...",
      success: "อัปเดตรหัสผ่านสำเร็จ!",
      error: "ไม่สามารถอัปเดตรหัสผ่านได้",
    });
  };

  const handleDeleteUser = (id: string) => {
    dispatch(
      showConfirmation({
        title: "ยืนยันการลบ",
        message: "คุณแน่ใจหรือไม่ว่าต้องการลบผู้ใช้งานนี้?",
        actionType: "delete",
        targetId: id,
      })
    );
  };

  const handleRestoreUser = (id: string) => {
    dispatch(
      showConfirmation({
        title: "ยืนยันการกู้คืน",
        message: "คุณแน่ใจหรือไม่ว่าต้องการกู้คืนผู้ใช้งานนี้?",
        actionType: "restore",
        targetId: id,
      })
    );
  };

  const handleConfirmAction = () => {
    if (!confirmState.actionType || !confirmState.targetId) return;
    let promise;
    if (confirmState.actionType === "delete") {
      promise = dispatch(deleteUser(confirmState.targetId)).unwrap();
      showPromiseToast(promise, {
        pending: "กำลังลบผู้ใช้...",
        success: "ผู้ใช้ถูกลบเรียบร้อยแล้ว",
        error: "เกิดข้อผิดพลาดในการลบ",
      });
    } else if (confirmState.actionType === "restore") {
      promise = dispatch(restoreUser(confirmState.targetId)).unwrap();
      showPromiseToast(promise, {
        pending: "กำลังกู้คืนผู้ใช้...",
        success: "กู้คืนผู้ใช้สำเร็จ!",
        error: "เกิดข้อผิดพลาดในการกู้คืน",
      });
    }
    dispatch(hideConfirmation());
  };

  // --- Handlers for Metrics Modal ---
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

  const handleCloseMetrics = () => {
    dispatch(closeMetricsModal());
  };

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

  // --- Return states and handlers ---
  return {
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
    isMetricsModalOpen,
    selectedCustomer,
    isHistoryModalOpen,
    historyData,
    isKeywordHistoryModalOpen,
    selectedKeyword,
    handleOpenUserModal,
    handleCloseUserModal,
    handleSaveUser,
    handlePasswordUpdate,
    handleDeleteUser,
    handleRestoreUser,
    handleConfirmAction,
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
    dispatch,
  };
};
