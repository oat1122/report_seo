// src/components/shared/users/UserManagementSeoDev.tsx
"use client";

import React from "react";
import {
  Alert,
  Box,
  CircularProgress,
  Container,
  Typography,
} from "@mui/material";
import { DashboardLayout } from "@/components/Layout/DashboardLayout";
import { useGetManagedCustomers } from "@/hooks/api/useUsersApi";
import { MetricsModal } from "./MetricsModal/MetricsModal";
import { UserTable } from "./UserTable";
import { useCustomerMetricsModal } from "./hooks/useCustomerMetricsModal";

const UserManagementSeoDev: React.FC = () => {
  const {
    data: managedCustomers = [],
    isLoading: loading,
    error: usersError,
  } = useGetManagedCustomers();

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
    handleUpdateRecommendKeyword,
    handleDeleteRecommendKeyword,
    aiOverviews,
    isLoadingAiOverviews,
    handleAddAiOverview,
    handleUpdateAiOverview,
    handleDeleteAiOverview,
    handleOpenHistory,
    handleCloseHistory,
    handleOpenKeywordHistory,
    handleCloseKeywordHistory,
  } = useCustomerMetricsModal(managedCustomers);

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
              customer management
            </Typography>
            <Typography variant="body1" color="text.secondary">
              customer management
            </Typography>
          </Box>
        </Box>

        {usersError && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {usersError.message ||
              "เกิดข้อผิดพลาดในการโหลดข้อมูล"}
          </Alert>
        )}

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
            <CircularProgress color="secondary" />
          </Box>
        ) : (
          <UserTable
            users={managedCustomers}
            onEdit={() => { }}
            onDelete={() => { }}
            onRestore={() => { }}
            onOpenMetrics={handleOpenMetrics}
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
            onUpdateRecommendKeyword={handleUpdateRecommendKeyword}
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
            aiOverviews={aiOverviews}
            isLoadingAiOverviews={isLoadingAiOverviews}
            onAddAiOverview={handleAddAiOverview}
            onUpdateAiOverview={handleUpdateAiOverview}
            onDeleteAiOverview={handleDeleteAiOverview}
          />
        )}
      </Container>
    </DashboardLayout>
  );
};

export default UserManagementSeoDev;
