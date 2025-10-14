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
import { MetricsModal } from "./MetricsModal";
import { useUserManagement } from "./hook/useUserManagement";

const UserManagement: React.FC = () => {
  const {
    users,
    seoDevs,
    loading,
    error,
    isModalOpen,
    isEditing,
    currentUser,
    setCurrentUser,
    handleOpenModal,
    handleCloseModal,
    handleSave,
    handleDelete,
    setError,
    // Metrics Modal
    isMetricsModalOpen,
    selectedCustomer,
    metricsData,
    keywordsData,
    handleOpenMetricsModal,
    handleCloseMetricsModal,
    handleSaveMetrics,
    handleAddKeyword,
    handleDeleteKeyword,
  } = useUserManagement();

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
        />
      </Container>
    </DashboardLayout>
  );
};

export default UserManagement;
