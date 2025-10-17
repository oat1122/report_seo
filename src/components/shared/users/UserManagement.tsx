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
import { useUserManagement } from "./hooks/useUserManagement";

const UserManagement: React.FC = () => {
  const {
    users,
    seoDevs,
    status,
    error,
    setError,
    metrics,
    keywords,
    recommendKeywords,
    isModalOpen,
    isEditing,
    currentUser,
    setCurrentUser,
    isMetricsModalOpen,
    selectedCustomer,
    confirmOpen,
    confirmTitle,
    confirmMessage,
    isHistoryModalOpen,
    historyData,
    // Keyword History Modal
    isKeywordHistoryModalOpen,
    keywordHistory,
    selectedKeyword,
    handleOpenModal,
    handleCloseModal,
    handleSave,
    handleDelete,
    handleRestore,
    handleOpenMetricsModal,
    handleCloseMetricsModal,
    handleSaveMetrics,
    handleAddKeyword,
    handleDeleteKeyword,
    handleUpdateKeyword,
    handleAddRecommendKeyword,
    handleDeleteRecommendKeyword,
    handleOpenHistoryModal,
    handleCloseHistoryModal,
    handleOpenKeywordHistoryModal,
    handleCloseKeywordHistoryModal,
    setConfirmOpen,
    confirmAction,
  } = useUserManagement();

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
