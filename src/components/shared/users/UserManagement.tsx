"use client";

import React from "react";
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
import { useUserManagementPage } from "./hooks/useUserManagementPage";
import {
  setCurrentUser,
  hideConfirmation,
  clearUserError,
} from "@/store/features/users/usersSlice";

const UserManagement: React.FC = () => {
  // Call the new hook to get all state and logic
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
  } = useUserManagementPage();

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
            onClick={() => handleOpenUserModal()}
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
            onEdit={handleOpenUserModal}
            onDelete={handleDeleteUser}
            onRestore={handleRestoreUser}
            onOpenMetrics={handleOpenMetrics}
          />
        )}

        {isModalOpen && currentUser && (
          <UserModal
            open={isModalOpen}
            isEditing={isEditing}
            currentUser={currentUser}
            onClose={handleCloseUserModal}
            onSave={handleSaveUser}
            onSavePassword={handlePasswordUpdate}
            onFormChange={(name, value) => {
              dispatch(setCurrentUser({ [name]: value }));
            }}
            seoDevs={seoDevs}
          />
        )}

        {selectedCustomer && (
          <MetricsModal
            open={isMetricsModalOpen}
            onClose={handleCloseMetrics}
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
            onOpenHistory={handleOpenHistory}
            isHistoryOpen={isHistoryModalOpen}
            onCloseHistory={handleCloseHistory}
            historyData={historyData}
            isKeywordHistoryOpen={isKeywordHistoryModalOpen}
            onOpenKeywordHistory={handleOpenKeywordHistory}
            onCloseKeywordHistory={handleCloseKeywordHistory}
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
