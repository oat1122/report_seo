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
import {
  useToggleMetricsHistoryVisibility,
  useToggleKeywordHistoryVisibility,
} from "@/hooks/api/useCustomersApi";
import { MetricsModal } from "./MetricsModal/MetricsModal";
import { HistoryModal } from "./MetricsModal/HistoryModal";
import { KeywordHistoryModal } from "./MetricsModal/KeywordHistoryModal";
import { UserTable } from "./UserTable";
import { useCustomerMetricsModal } from "@/hooks/ui/useCustomerMetricsModal";

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

  const toggleMetricsVisibility = useToggleMetricsHistoryVisibility();
  const toggleKeywordVisibility = useToggleKeywordHistoryVisibility();

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
            {usersError.message || "เกิดข้อผิดพลาดในการโหลดข้อมูล"}
          </Alert>
        )}

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
            <CircularProgress color="secondary" />
          </Box>
        ) : (
          <UserTable
            users={managedCustomers}
            onEdit={() => {}}
            onDelete={() => {}}
            onRestore={() => {}}
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
            onOpenKeywordHistory={handleOpenKeywordHistory}
            isLoadingMetrics={isLoadingMetrics}
            isLoadingKeywords={isLoadingKeywords}
            isLoadingRecommend={isLoadingRecommend}
            aiOverviews={aiOverviews}
            isLoadingAiOverviews={isLoadingAiOverviews}
            onAddAiOverview={handleAddAiOverview}
            onUpdateAiOverview={handleUpdateAiOverview}
            onDeleteAiOverview={handleDeleteAiOverview}
          />
        )}

        {selectedCustomer && isHistoryModalOpen && (
          <HistoryModal
            open={isHistoryModalOpen}
            onClose={handleCloseHistory}
            history={historyData.metricsHistory}
            keywordHistory={historyData.keywordHistory}
            customerName={selectedCustomer.name || ""}
            isLoading={isLoadingCombinedHistory}
            canManage
            onToggleMetricsVisibility={(payload) =>
              toggleMetricsVisibility.mutate({
                customerId: selectedCustomer.id,
                ...payload,
              })
            }
            onToggleKeywordVisibility={(payload) =>
              toggleKeywordVisibility.mutate({
                customerId: selectedCustomer.id,
                ...payload,
              })
            }
          />
        )}
        {selectedKeyword && isKeywordHistoryModalOpen && (
          <KeywordHistoryModal
            open={isKeywordHistoryModalOpen}
            onClose={handleCloseKeywordHistory}
            history={keywordHistory}
            keywordName={selectedKeyword.keyword}
            isLoading={isLoadingSpecificHistory}
          />
        )}
      </Container>
    </DashboardLayout>
  );
};

export default UserManagementSeoDev;
