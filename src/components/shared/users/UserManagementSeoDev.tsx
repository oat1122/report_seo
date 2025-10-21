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
import { useUserManagementSeoDev } from "./hooks/useUserManagementSeoDev";
import {
  setCurrentUser,
  clearUserError,
} from "@/store/features/users/usersSlice";

const UserManagementSeoDev: React.FC = () => {
  // Destructure ค่าที่ถูกต้องจาก Hook ที่อัปเดตแล้ว
  const {
    users: managedCustomers,
    status,
    usersError, // เปลี่ยนจาก error เป็น usersError
    isModalOpen,
    isEditing,
    currentUser,
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
  } = useUserManagementSeoDev();

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
            onSave={handleSaveUser}
            onSavePassword={handlePasswordUpdate}
            onFormChange={(name, value) => {
              dispatch(setCurrentUser({ [name]: value }));
            }}
            seoDevs={[]} // Not needed for this view
            isSeoDevView={true}
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
      </Container>
    </DashboardLayout>
  );
};

export default UserManagementSeoDev;
