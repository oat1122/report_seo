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

const UserManagementSeoDev: React.FC = () => {
  const {
    users: managedCustomers,
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
    isHistoryModalOpen,
    historyData,
    handleOpenModal,
    handleCloseModal,
    handleSave,
    handleOpenMetricsModal,
    handleCloseMetricsModal,
    handleSaveMetrics,
    handleAddKeyword,
    handleDeleteKeyword,
    handleAddRecommendKeyword,
    handleDeleteRecommendKeyword,
    handleOpenHistoryModal,
    handleCloseHistoryModal,
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
            onClick={() => handleOpenModal()}
          >
            Add Customer
          </Button>
        </Box>

        {error && (
          <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
            <CircularProgress color="secondary" />
          </Box>
        ) : (
          <UserTable
            users={managedCustomers}
            onEdit={handleOpenModal}
            onDelete={() => {}} // Disabled for SEO Dev
            onRestore={() => {}} // Disabled for SEO Dev
            onOpenMetrics={handleOpenMetricsModal}
            isSeoDevView={true} // Pass a prop to hide delete/restore
          />
        )}

        <UserModal
          open={isModalOpen}
          isEditing={isEditing}
          currentUser={currentUser}
          onClose={handleCloseModal}
          onSave={handleSave}
          setCurrentUser={setCurrentUser}
          seoDevs={[]} // Not needed for this view
          isSeoDevView={true}
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
            onOpenHistory={handleOpenHistoryModal}
            isHistoryOpen={isHistoryModalOpen}
            onCloseHistory={handleCloseHistoryModal}
            historyData={historyData}
          />
        )}
      </Container>
    </DashboardLayout>
  );
};

export default UserManagementSeoDev;
