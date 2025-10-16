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

  const handleSave = async () => {
    setError(null);
    try {
      if (isEditing) {
        await dispatch(updateUser(currentUser)).unwrap();
      } else {
        await dispatch(addUser(currentUser)).unwrap();
      }
      handleCloseModal();
    } catch (err: any) {
      // err จะเป็น string ที่ส่งมาจาก rejectWithValue
      setError(
        typeof err === "string" ? err : err.message || "Failed to save user"
      );
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        await dispatch(deleteUser(id)).unwrap();
      } catch (err: any) {
        // err จะเป็น string ที่ส่งมาจาก rejectWithValue
        setError(
          typeof err === "string" ? err : err.message || "Failed to delete user"
        );
      }
    }
  };

  // ฟังก์ชันใหม่สำหรับ Restore
  const handleRestore = async (id: string) => {
    if (window.confirm("Are you sure you want to restore this user?")) {
      try {
        await dispatch(restoreUser(id)).unwrap();
      } catch (err: any) {
        setError(
          typeof err === "string"
            ? err
            : err.message || "Failed to restore user"
        );
      }
    }
  };

  // === Handlers for Metrics Modal ===
  const handleOpenMetricsModal = (customer: User) => {
    setSelectedCustomer(customer);
    // Dispatch action เพื่อดึงข้อมูลทั้งหมดพร้อมกัน
    dispatch(fetchMetrics(customer.id));
    dispatch(fetchKeywords(customer.id));
    dispatch(fetchRecommendKeywords(customer.id));
    setIsMetricsModalOpen(true);
  };

  const handleCloseMetricsModal = () => {
    setIsMetricsModalOpen(false);
    setSelectedCustomer(null);
    dispatch(clearMetricsState()); // เคลียร์ State ของ metrics เมื่อปิด Modal
  };

  const handleSaveMetrics = async (data: Partial<OverallMetrics>) => {
    if (!selectedCustomer) return;
    await dispatch(
      saveMetrics({
        customerId: selectedCustomer.id,
        data: data as OverallMetricsForm,
      })
    );
  };

  const handleAddKeyword = async (keyword: KeywordReportForm) => {
    if (!selectedCustomer) return;
    await dispatch(
      addKeyword({ customerId: selectedCustomer.id, data: keyword })
    );
  };

  const handleDeleteKeyword = async (keywordId: string) => {
    await dispatch(deleteKeyword(keywordId));
  };

  const handleAddRecommendKeyword = async (keyword: KeywordRecommendForm) => {
    if (!selectedCustomer) return;
    await dispatch(
      addRecommendKeyword({ customerId: selectedCustomer.id, data: keyword })
    );
  };

  const handleDeleteRecommendKeyword = async (recommendId: string) => {
    await dispatch(deleteRecommendKeyword(recommendId));
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
      </Container>
    </DashboardLayout>
  );
};

export default UserManagement;
