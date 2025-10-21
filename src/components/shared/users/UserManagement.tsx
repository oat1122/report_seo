"use client";

import React, { useState } from "react";
import {
  Box,
  Container,
  Typography,
  Button,
  CircularProgress,
  Alert,
} from "@mui/material";
import { Add } from "@mui/icons-material";
import { DashboardLayout } from "@/components/Layout/DashboardLayout";
import { UserTable } from "./UserTable";
import { UserModal } from "./UserModal";
import { MetricsModal } from "./MetricsModal/MetricsModal";
import { ConfirmAlert } from "../ConfirmAlert";
import { useUserManagement } from "./hooks/useUserManagement";
import { useAppDispatch } from "@/store/hooks";
import {
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
} from "@/store/features/metrics/metricsSlice";
import { User, UserFormState } from "@/types/user";
import { showPromiseToast } from "../toast/lib/toastify";
import {
  KeywordReport,
  KeywordReportForm,
  KeywordRecommendForm,
  OverallMetrics,
  OverallMetricsForm,
} from "@/types";
import { Role } from "@/types/auth";
import axios from "@/lib/axios";
import { OverallMetricsHistory, KeywordReportHistory } from "@/types/history";

// Define a type for the combined history data
interface CombinedHistoryData {
  metricsHistory: OverallMetricsHistory[];
  keywordHistory: KeywordReportHistory[];
}

const UserManagement: React.FC = () => {
  const dispatch = useAppDispatch();
  const {
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
    handleOpenMetricsModal,
    handleCloseMetricsModal: closeMetricsModalFromHook,
  } = useUserManagement();

  // Local state for metrics modal and related features
  const [isMetricsModalOpen, setIsMetricsModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<User | null>(null);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [historyData, setHistoryData] = useState<CombinedHistoryData>({
    metricsHistory: [],
    keywordHistory: [],
  });
  const [isKeywordHistoryModalOpen, setIsKeywordHistoryModalOpen] =
    useState(false);
  const [selectedKeyword, setSelectedKeyword] = useState<KeywordReport | null>(
    null
  );

  // --- Handlers ---
  const handleOpenModal = async (user?: User) => {
    if (user && user.role === Role.CUSTOMER) {
      // Fetch additional customer profile data
      try {
        const response = await axios.get(`/users/${user.id}`);
        const userData = response.data;
        dispatch(
          openUserModal({
            ...user,
            companyName: userData.customerProfile?.name,
            domain: userData.customerProfile?.domain,
            seoDevId: userData.customerProfile?.seoDevId,
          } as User)
        );
      } catch (err) {
        console.error("Failed to fetch customer data:", err);
        dispatch(openUserModal(user));
      }
    } else {
      dispatch(openUserModal(user));
    }
  };

  const handleCloseModal = () => {
    dispatch(closeUserModal());
  };

  const handleSave = async () => {
    if (!currentUser) return;

    // If there's a new password, dispatch the updatePassword action
    if (currentUser.newPassword) {
      if (currentUser.newPassword !== currentUser.confirmPassword) {
        // Show error toast
        showPromiseToast(Promise.reject("Passwords do not match"), {
          pending: "",
          success: "",
          error: "รหัสผ่านไม่ตรงกัน",
        });
        return;
      }
      const passPromise = dispatch(
        updatePassword({ userId: currentUser.id!, values: currentUser })
      ).unwrap();
      showPromiseToast(passPromise, {
        pending: "กำลังอัปเดตรหัสผ่าน...",
        success: "อัปเดตรหัสผ่านสำเร็จ!",
        error: "ไม่สามารถอัปเดตรหัสผ่านได้",
      });

      // Also update other user info if needed
      const infoToUpdate = { ...currentUser };
      delete infoToUpdate.newPassword;
      delete infoToUpdate.confirmPassword;
      delete infoToUpdate.currentPassword;

      if (Object.keys(infoToUpdate).length > 1) {
        // more than just ID
        const infoPromise = dispatch(updateUser(infoToUpdate)).unwrap();
        showPromiseToast(infoPromise, {
          pending: "กำลังอัปเดตข้อมูลผู้ใช้...",
          success: "อัปเดตข้อมูลผู้ใช้สำเร็จ!",
          error: "ไม่สามารถอัปเดตข้อมูลผู้ใช้ได้",
        });
      }
    } else {
      const action = isEditing ? updateUser(currentUser) : addUser(currentUser);
      const promise = dispatch(action).unwrap();

      showPromiseToast(promise, {
        pending: "กำลังบันทึกข้อมูล...",
        success: isEditing ? "อัปเดตผู้ใช้สำเร็จ!" : "เพิ่มผู้ใช้สำเร็จ!",
        error: "เกิดข้อผิดพลาดในการบันทึก",
      });
    }
  };

  const handleDelete = (id: string) => {
    dispatch(
      showConfirmation({
        title: "ยืนยันการลบ",
        message: "คุณแน่ใจหรือไม่ว่าต้องการลบผู้ใช้งานนี้?",
        actionType: "delete",
        targetId: id,
      })
    );
  };

  const handleRestore = (id: string) => {
    dispatch(
      showConfirmation({
        title: "ยืนยันการกู้คืน",
        message: "คุณแน่ใจหรือไม่ว่าต้องการกู้คืนผู้ใช้งานนี้?",
        actionType: "restore",
        targetId: id,
      })
    );
  };

  // Handler สำหรับจัดการการยืนยันจาก Dialog
  const handleConfirmAction = () => {
    if (!confirmState.actionType || !confirmState.targetId) return;

    let promise;
    let messages;

    if (confirmState.actionType === "delete") {
      promise = dispatch(deleteUser(confirmState.targetId)).unwrap();
      messages = {
        pending: "กำลังลบผู้ใช้...",
        success: "ผู้ใช้ถูกลบเรียบร้อยแล้ว",
        error: "เกิดข้อผิดพลาดในการลบ",
      };
    } else if (confirmState.actionType === "restore") {
      promise = dispatch(restoreUser(confirmState.targetId)).unwrap();
      messages = {
        pending: "กำลังกู้คืนผู้ใช้...",
        success: "กู้คืนผู้ใช้สำเร็จ!",
        error: "เกิดข้อผิดพลาดในการกู้คืน",
      };
    }

    if (promise && messages) {
      showPromiseToast(promise, messages);
    }

    // ปิด Dialog และเคลียร์ state
    dispatch(hideConfirmation());
  };

  const onOpenMetrics = (user: User) => {
    setSelectedCustomer(user);
    setIsMetricsModalOpen(true);
    handleOpenMetricsModal(user);
  };

  const handleSaveMetrics = async (data: Partial<OverallMetrics>) => {
    if (!selectedCustomer) return;
    const promise = dispatch(
      saveMetrics({
        customerId: selectedCustomer.id,
        data: data as OverallMetricsForm,
      })
    ).unwrap();
    showPromiseToast(promise, {
      pending: "กำลังบันทึก Metrics...",
      success: "บันทึก Metrics สำเร็จ!",
      error: "บันทึก Metrics ไม่สำเร็จ",
    });
  };

  const handleAddKeyword = async (keyword: KeywordReportForm) => {
    if (!selectedCustomer) return;
    const promise = dispatch(
      addKeyword({ customerId: selectedCustomer.id, data: keyword })
    ).unwrap();
    showPromiseToast(promise, {
      pending: "กำลังเพิ่มคีย์เวิร์ด...",
      success: "เพิ่มคีย์เวิร์ดสำเร็จ!",
      error: "เพิ่มคีย์เวิร์ดไม่สำเร็จ",
    });
  };

  const handleDeleteKeyword = async (keywordId: string) => {
    const promise = dispatch(deleteKeyword(keywordId)).unwrap();
    showPromiseToast(promise, {
      pending: "กำลังลบคีย์เวิร์ด...",
      success: "ลบคีย์เวิร์ดแล้ว",
      error: "ลบคีย์เวิร์ดไม่สำเร็จ",
    });
  };

  const handleUpdateKeyword = async (
    keywordId: string,
    data: KeywordReportForm
  ) => {
    const promise = dispatch(updateKeyword({ keywordId, data })).unwrap();
    showPromiseToast(promise, {
      pending: "กำลังอัปเดตคีย์เวิร์ด...",
      success: "อัปเดตคีย์เวิร์ดสำเร็จ!",
      error: "อัปเดตคีย์เวิร์ดไม่สำเร็จ",
    });
  };

  const handleAddRecommendKeyword = async (keyword: KeywordRecommendForm) => {
    if (!selectedCustomer) return;
    const promise = dispatch(
      addRecommendKeyword({ customerId: selectedCustomer.id, data: keyword })
    ).unwrap();
    showPromiseToast(promise, {
      pending: "กำลังแนะนำคีย์เวิร์ด...",
      success: "แนะนำคีย์เวิร์ดสำเร็จ!",
      error: "แนะนำคีย์เวิร์ดไม่สำเร็จ",
    });
  };

  const handleDeleteRecommendKeyword = async (recommendId: string) => {
    const promise = dispatch(deleteRecommendKeyword(recommendId)).unwrap();
    showPromiseToast(promise, {
      pending: "กำลังลบ...",
      success: "ลบคีย์เวิร์ดแนะนำแล้ว",
      error: "เกิดข้อผิดพลาด",
    });
  };

  const handleOpenKeywordHistoryModal = (keyword: KeywordReport) => {
    setSelectedKeyword(keyword);
    dispatch(fetchKeywordHistory(keyword.id));
    setIsKeywordHistoryModalOpen(true);
  };

  const handleCloseKeywordHistoryModal = () => {
    setIsKeywordHistoryModalOpen(false);
    setSelectedKeyword(null);
  };

  const handleOpenHistoryModal = async () => {
    if (!selectedCustomer) return;
    try {
      const response = await axios.get<CombinedHistoryData>(
        `/customers/${selectedCustomer.id}/metrics/history`
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

  const handleCloseHistoryModal = () => {
    setIsHistoryModalOpen(false);
    setHistoryData({ metricsHistory: [], keywordHistory: [] });
  };

  const loading = status === "loading";

  return (
    <DashboardLayout>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 4,
            flexWrap: "wrap",
            gap: 2,
          }}
        >
          <Box>
            <Typography variant="h2" component="h1" gutterBottom>
              การจัดการผู้ใช้งาน
            </Typography>
            <Typography variant="body1" color="text.secondary">
              จัดการบัญชีผู้ใช้งานทั้งหมดในระบบ
            </Typography>
          </Box>
          <Button
            variant="contained"
            color="secondary"
            size="large"
            startIcon={<Add />}
            onClick={() => handleOpenModal()}
            sx={{
              px: 4,
              py: 1.5,
              fontSize: "1rem",
              fontWeight: 600,
            }}
          >
            เพิ่มผู้ใช้งาน
          </Button>
        </Box>

        {usersError && (
          <Alert
            severity="error"
            onClose={() => dispatch(clearUserError())}
            sx={{ mb: 3, borderRadius: 2 }}
          >
            {usersError}
          </Alert>
        )}

        {loading ? (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              minHeight: "400px",
            }}
          >
            <CircularProgress size={48} color="secondary" />
          </Box>
        ) : (
          <UserTable
            users={users}
            onEdit={handleOpenModal}
            onDelete={handleDelete}
            onRestore={handleRestore}
            onOpenMetrics={onOpenMetrics}
          />
        )}

        {isModalOpen && currentUser && (
          <UserModal
            open={isModalOpen}
            isEditing={isEditing}
            currentUser={currentUser}
            onClose={handleCloseModal}
            onSave={handleSave}
            onFormChange={(name, value) => {
              dispatch(setCurrentUser({ [name]: value }));
            }}
            seoDevs={seoDevs}
          />
        )}

        {selectedCustomer && (
          <MetricsModal
            open={isMetricsModalOpen}
            onClose={() => {
              setIsMetricsModalOpen(false);
              setSelectedCustomer(null);
              closeMetricsModalFromHook();
            }}
            customer={selectedCustomer}
            metricsData={metrics}
            keywordsData={keywords}
            onSaveMetrics={handleSaveMetrics}
            onAddKeyword={handleAddKeyword}
            onDeleteKeyword={handleDeleteKeyword}
            onUpdateKeyword={handleUpdateKeyword}
            recommendKeywordsData={recommendKeywords}
            onAddRecommendKeyword={handleAddRecommendKeyword}
            onDeleteRecommendKeyword={handleDeleteRecommendKeyword}
            onOpenHistory={handleOpenHistoryModal}
            isHistoryOpen={isHistoryModalOpen}
            onCloseHistory={handleCloseHistoryModal}
            historyData={historyData}
            isKeywordHistoryOpen={isKeywordHistoryModalOpen}
            onOpenKeywordHistory={handleOpenKeywordHistoryModal}
            onCloseKeywordHistory={handleCloseKeywordHistoryModal}
            keywordHistoryData={keywordHistory}
            selectedKeyword={selectedKeyword}
          />
        )}

        <ConfirmAlert
          open={confirmState.isOpen}
          onClose={() => dispatch(hideConfirmation())}
          onConfirm={handleConfirmAction}
          title={confirmState.title}
          message={confirmState.message}
        />
      </Container>
    </DashboardLayout>
  );
};

export default UserManagement;
