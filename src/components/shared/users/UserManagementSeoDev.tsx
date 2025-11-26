// src/components/shared/users/UserManagementSeoDev.tsx
"use client";

import React, { useMemo } from "react";
import {
  Box,
  Container,
  Typography,
  Button,
  CircularProgress,
  Alert,
} from "@mui/material";
import { Add } from "@mui/icons-material";
import { useSession } from "next-auth/react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchUsers,
  fetchSeoDevs,
  clearUserError,
} from "@/store/features/users/usersSlice";
import { DashboardLayout } from "@/components/Layout/DashboardLayout";
import { UserTable } from "./UserTable";
import { UserModal } from "./UserModal";
import { MetricsModal } from "./MetricsModal/MetricsModal";
import { useUserModalLogic } from "./hooks/useUserModalLogic";
import { useCustomerMetricsModal } from "./hooks/useCustomerMetricsModal";
import { Role } from "@/types/auth";
import { User } from "@/types/user";

const UserManagementSeoDev: React.FC = () => {
  const { data: session } = useSession();
  const dispatch = useAppDispatch();

  // 1. ดึงข้อมูล Users และ SeoDevs ทั้งหมดจาก Redux
  const {
    users: allUsers,
    status,
    error: usersError,
  } = useAppSelector((state) => state.users);

  React.useEffect(() => {
    if (status === "idle") {
      dispatch(fetchUsers());
      dispatch(fetchSeoDevs());
    }
  }, [status, dispatch]);

  // 2. กรองข้อมูลเฉพาะลูกค้าของ SEO Dev ที่ล็อกอินอยู่
  const currentSeoDevId = session?.user?.id;
  const managedCustomers = useMemo(() => {
    return allUsers.filter(
      (user: User) =>
        user.role === Role.CUSTOMER &&
        user.customerProfile?.seoDevId === currentSeoDevId
    );
  }, [allUsers, currentSeoDevId]);

  // 3. เรียกใช้ Hooks ใหม่ (เหมือนกับ UserManagement.tsx)
  const {
    isModalOpen,
    isEditing,
    currentUser,
    handleOpenUserModal,
    handleCloseUserModal,
    handleSaveUser,
    handlePasswordUpdate,
    handleFormChange,
  } = useUserModalLogic();

  const {
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
    isLoadingMetrics,
    isLoadingKeywords,
    isLoadingRecommend,
    isLoadingCombinedHistory,
    isLoadingSpecificHistory,
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
  } = useCustomerMetricsModal(managedCustomers);

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
              Customer Management
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Manage all customer accounts assigned to you.
            </Typography>
          </Box>
          <Button
            variant="contained"
            color="secondary"
            size="large"
            startIcon={<Add />}
            onClick={() => handleOpenUserModal()}
          >
            Add Customer
          </Button>
        </Box>

        {usersError && (
          <Alert
            severity="error"
            onClose={() => dispatch(clearUserError())}
            sx={{ mb: 3 }}
          >
            {usersError}
          </Alert>
        )}

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
            <CircularProgress color="secondary" />
          </Box>
        ) : (
          <UserTable
            users={managedCustomers}
            onEdit={handleOpenUserModal}
            onDelete={() => {}} // Disabled for SEO Dev
            onRestore={() => {}} // Disabled for SEO Dev
            onOpenMetrics={handleOpenMetrics}
            isSeoDevView={true} // Pass a prop to hide delete/restore
          />
        )}

        {isModalOpen && currentUser && (
          <UserModal
            open={isModalOpen}
            isEditing={isEditing}
            currentUser={currentUser}
            onClose={handleCloseUserModal}
            onSave={() =>
              handleSaveUser(session?.user as { id: string; role: Role })
            }
            onSavePassword={handlePasswordUpdate}
            onFormChange={handleFormChange}
            seoDevs={[]}
            isSeoDevView={true}
          />
        )}

        {selectedCustomer && (
          <MetricsModal
            open={isMetricsModalOpen}
            onClose={handleCloseMetrics}
            customer={selectedCustomer}
            metricsData={metrics || null}
            keywordsData={keywords}
            onSaveMetrics={handleSaveMetrics}
            onAddKeyword={handleAddKeyword}
            onDeleteKeyword={handleDeleteKeyword}
            onUpdateKeyword={handleUpdateKeyword}
            recommendKeywordsData={recommendKeywords}
            onAddRecommendKeyword={handleAddRecommendKeyword}
            onDeleteRecommendKeyword={handleDeleteRecommendKeyword}
            onOpenHistory={handleOpenHistory}
            isHistoryOpen={isHistoryModalOpen}
            onCloseHistory={handleCloseHistory}
            historyData={historyData}
            isKeywordHistoryOpen={isKeywordHistoryModalOpen}
            onOpenKeywordHistory={handleOpenKeywordHistory}
            onCloseKeywordHistory={handleCloseKeywordHistory}
            keywordHistoryData={keywordHistory}
            selectedKeyword={selectedKeyword}
            isLoadingMetrics={isLoadingMetrics}
            isLoadingKeywords={isLoadingKeywords}
            isLoadingRecommend={isLoadingRecommend}
            isLoadingCombinedHistory={isLoadingCombinedHistory}
            isLoadingSpecificHistory={isLoadingSpecificHistory}
          />
        )}
      </Container>
    </DashboardLayout>
  );
};

export default UserManagementSeoDev;
