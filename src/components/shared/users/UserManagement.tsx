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
import { User, UserFormState } from "@/types/user";
import { Role } from "@/types/auth";
import {
  fetchMetricsAPI,
  saveMetricsAPI,
  fetchKeywordsAPI,
  addKeywordAPI,
  deleteKeywordAPI,
  fetchRecommendKeywordsAPI,
  addRecommendKeywordAPI,
  deleteRecommendKeywordAPI,
  fetchUserByIdAPI,
} from "./lib/userService";
import {
  OverallMetrics,
  KeywordReport,
  KeywordReportForm,
  OverallMetricsForm,
  KeywordRecommend,
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
  const loading = status === "loading";

  // Local State สำหรับ Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserFormState>({});
  const [error, setError] = useState<string | null>(null);

  // State สำหรับ Metrics Modal
  const [isMetricsModalOpen, setIsMetricsModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<User | null>(null);
  const [metricsData, setMetricsData] = useState<OverallMetrics | null>(null);
  const [keywordsData, setKeywordsData] = useState<KeywordReport[]>([]);
  const [recommendKeywordsData, setRecommendKeywordsData] = useState<
    KeywordRecommend[]
  >([]);

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
          const userData = await fetchUserByIdAPI(user.id);
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
  const handleOpenMetricsModal = async (customer: User) => {
    setSelectedCustomer(customer);
    try {
      const [metrics, keywords, recommends] = await Promise.all([
        fetchMetricsAPI(customer.id),
        fetchKeywordsAPI(customer.id),
        fetchRecommendKeywordsAPI(customer.id),
      ]);
      setMetricsData(metrics);
      setKeywordsData(keywords);
      setRecommendKeywordsData(recommends);
    } catch (err) {
      setError((err as Error).message);
    }
    setIsMetricsModalOpen(true);
  };

  const handleCloseMetricsModal = () => {
    setIsMetricsModalOpen(false);
    setSelectedCustomer(null);
    setMetricsData(null);
    setKeywordsData([]);
    setRecommendKeywordsData([]);
  };

  const handleSaveMetrics = async (data: Partial<OverallMetrics>) => {
    if (!selectedCustomer) return;
    try {
      const updatedMetrics = await saveMetricsAPI(
        selectedCustomer.id,
        data as OverallMetricsForm
      );
      setMetricsData(updatedMetrics);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const handleAddKeyword = async (keyword: KeywordReportForm) => {
    if (!selectedCustomer) return;
    try {
      await addKeywordAPI(selectedCustomer.id, keyword);
      const keywords = await fetchKeywordsAPI(selectedCustomer.id);
      setKeywordsData(keywords);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const handleDeleteKeyword = async (keywordId: string) => {
    try {
      await deleteKeywordAPI(keywordId);
      setKeywordsData((prev) => prev.filter((kw) => kw.id !== keywordId));
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const handleAddRecommendKeyword = async (keyword: KeywordRecommendForm) => {
    if (!selectedCustomer) return;
    try {
      await addRecommendKeywordAPI(selectedCustomer.id, keyword);
      const updatedRecommends = await fetchRecommendKeywordsAPI(
        selectedCustomer.id
      );
      setRecommendKeywordsData(updatedRecommends);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const handleDeleteRecommendKeyword = async (recommendId: string) => {
    try {
      await deleteRecommendKeywordAPI(recommendId);
      setRecommendKeywordsData((prev) =>
        prev.filter((kw) => kw.id !== recommendId)
      );
    } catch (err) {
      setError((err as Error).message);
    }
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

        <MetricsModal
          open={isMetricsModalOpen}
          onClose={handleCloseMetricsModal}
          customer={selectedCustomer}
          metricsData={metricsData}
          keywordsData={keywordsData}
          onSaveMetrics={handleSaveMetrics}
          onAddKeyword={handleAddKeyword}
          onDeleteKeyword={handleDeleteKeyword}
          recommendKeywordsData={recommendKeywordsData}
          onAddRecommendKeyword={handleAddRecommendKeyword}
          onDeleteRecommendKeyword={handleDeleteRecommendKeyword}
        />
      </Container>
    </DashboardLayout>
  );
};

export default UserManagement;
