"use client";

import React, { useState, useEffect } from "react";
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
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchUsers,
  fetchSeoDevs,
  addUser,
  updateUser,
  deleteUser,
  restoreUser,
} from "@/store/features/users/usersSlice";
import {
  fetchMetrics,
  fetchKeywords,
  fetchRecommendKeywords,
  saveMetrics,
  addKeyword,
  deleteKeyword,
  addRecommendKeyword,
  deleteRecommendKeyword,
  clearMetricsState,
} from "@/store/features/metrics/metricsSlice";
import { User, UserFormState } from "@/types/user";
import { Role } from "@/types/auth";
import axios from "@/lib/axios";
import {
  OverallMetrics,
  OverallMetricsForm,
  KeywordReportForm,
  KeywordRecommendForm,
} from "@/types/metrics";
import { ConfirmAlert } from "../ConfirmAlert";
import { showPromiseToast } from "@/lib/toastify";

const UserManagement: React.FC = () => {
  // Redux State และ Dispatch
  const dispatch = useAppDispatch();
  const {
    users,
    seoDevs,
    status,
    error: usersError,
  } = useAppSelector((state) => state.users);

  // Redux State สำหรับ Metrics
  const {
    metrics,
    keywords,
    recommendKeywords,
    status: metricsStatus,
  } = useAppSelector((state) => state.metrics);

  const loading = status === "loading";

  // Local State สำหรับ Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserFormState>({});
  const [error, setError] = useState<string | null>(null);

  // State สำหรับ Metrics Modal
  const [isMetricsModalOpen, setIsMetricsModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<User | null>(null);

  // State สำหรับ ConfirmAlert
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<() => void>(() => {});
  const [confirmTitle, setConfirmTitle] = useState("");
  const [confirmMessage, setConfirmMessage] = useState("");

  // Fetch Users และ SEO Devs เมื่อ Component Mount
  useEffect(() => {
    if (status === "idle") {
      dispatch(fetchUsers());
      dispatch(fetchSeoDevs());
    }
  }, [status, dispatch]);

  // Update error จาก Redux
  useEffect(() => {
    if (usersError) {
      setError(usersError);
    }
  }, [usersError]);

  const handleOpenModal = async (user?: User) => {
    setIsEditing(!!user);
    if (user) {
      if (user.role === Role.CUSTOMER) {
        try {
          const response = await axios.get(`/users/${user.id}`);
          const userData = response.data;
          setCurrentUser({
            ...user,
            companyName: userData.customerProfile?.name,
            domain: userData.customerProfile?.domain,
            seoDevId: userData.customerProfile?.seoDevId,
          });
        } catch (err) {
          console.error("Failed to fetch customer data:", err);
          setCurrentUser(user);
        }
      } else {
        setCurrentUser(user);
      }
    } else {
      setCurrentUser({ role: Role.CUSTOMER }); // Default role
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentUser({});
  };

  /**
   * ✅ [IMPROVED] - Uses showPromiseToast for save/update operations.
   */
  const handleSave = async () => {
    setError(null);
    const action = isEditing ? updateUser(currentUser) : addUser(currentUser);
    const promise = dispatch(action).unwrap();

    showPromiseToast(promise, {
      pending: "กำลังบันทึกข้อมูล...",
      success: isEditing ? "อัปเดตผู้ใช้สำเร็จ!" : "เพิ่มผู้ใช้สำเร็จ!",
      error: "เกิดข้อผิดพลาดในการบันทึก",
    });

    try {
      await promise;
      handleCloseModal();
    } catch (err: any) {
      setError(typeof err === "string" ? err : "Failed to save user");
    }
  };

  /**
   * ✅ [IMPROVED] - Uses showPromiseToast for delete operation.
   */
  const handleDelete = (id: string) => {
    setConfirmTitle("ยืนยันการลบ");
    setConfirmMessage("คุณแน่ใจหรือไม่ว่าต้องการลบผู้ใช้งานนี้?");
    setConfirmAction(() => () => {
      const promise = dispatch(deleteUser(id)).unwrap();
      showPromiseToast(promise, {
        pending: "กำลังลบผู้ใช้...",
        success: "ผู้ใช้ถูกลบเรียบร้อยแล้ว",
        error: "เกิดข้อผิดพลาดในการลบ",
      });
      setConfirmOpen(false);
    });
    setConfirmOpen(true);
  };

  /**
   * ✅ [IMPROVED] - Uses showPromiseToast for restore operation.
   */
  const handleRestore = (id: string) => {
    setConfirmTitle("ยืนยันการกู้คืน");
    setConfirmMessage("คุณแน่ใจหรือไม่ว่าต้องการกู้คืนผู้ใช้งานนี้?");
    setConfirmAction(() => () => {
      const promise = dispatch(restoreUser(id)).unwrap();
      showPromiseToast(promise, {
        pending: "กำลังกู้คืนผู้ใช้...",
        success: "กู้คืนผู้ใช้สำเร็จ!",
        error: "เกิดข้อผิดพลาดในการกู้คืน",
      });
      setConfirmOpen(false);
    });
    setConfirmOpen(true);
  };

  // === Handlers for Metrics Modal (All improved with showPromiseToast) ===
  const handleOpenMetricsModal = (customer: User) => {
    setSelectedCustomer(customer);
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

    setIsMetricsModalOpen(true);
  };

  const handleCloseMetricsModal = () => {
    setIsMetricsModalOpen(false);
    setSelectedCustomer(null);
    dispatch(clearMetricsState()); // เคลียร์ State ของ metrics เมื่อปิด Modal
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

        {error && (
          <Alert
            severity="error"
            onClose={() => setError(null)}
            sx={{ mb: 3, borderRadius: 2 }}
          >
            {error}
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
            onOpenMetrics={handleOpenMetricsModal}
          />
        )}

        <UserModal
          open={isModalOpen}
          isEditing={isEditing}
          currentUser={currentUser}
          onClose={handleCloseModal}
          onSave={handleSave}
          setCurrentUser={setCurrentUser}
          seoDevs={seoDevs}
        />

        {selectedCustomer && (
          <MetricsModal
            open={isMetricsModalOpen}
            onClose={handleCloseMetricsModal}
            customer={selectedCustomer}
            metricsData={metrics}
            keywordsData={keywords}
            onSaveMetrics={handleSaveMetrics}
            onAddKeyword={handleAddKeyword}
            onDeleteKeyword={handleDeleteKeyword}
            recommendKeywordsData={recommendKeywords}
            onAddRecommendKeyword={handleAddRecommendKeyword}
            onDeleteRecommendKeyword={handleDeleteRecommendKeyword}
          />
        )}
        <ConfirmAlert
          open={confirmOpen}
          onClose={() => setConfirmOpen(false)}
          onConfirm={confirmAction}
          title={confirmTitle}
          message={confirmMessage}
        />
      </Container>
    </DashboardLayout>
  );
};

export default UserManagement;
