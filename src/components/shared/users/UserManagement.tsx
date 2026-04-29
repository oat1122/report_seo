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
import { useSession } from "next-auth/react";
import { useGetUsers, useGetSeoDevs } from "@/hooks/api/useUsersApi";
import {
  useToggleMetricsHistoryVisibility,
  useToggleKeywordHistoryVisibility,
} from "@/hooks/api/useCustomersApi";
import { Role } from "@/types/auth";
import { DashboardLayout } from "@/components/Layout/DashboardLayout";
import { UserTable } from "./UserTable";
import { UserModal } from "./UserModal";
import { MetricsModal } from "./MetricsModal/MetricsModal";
import { HistoryModal } from "./MetricsModal/HistoryModal";
import { KeywordHistoryModal } from "./MetricsModal/KeywordHistoryModal";
import { ConfirmAlert } from "../ConfirmAlert";
import { useUserModalLogic } from "@/hooks/ui/useUserModalLogic";
import { useUserConfirmDialog } from "@/hooks/ui/useUserConfirmDialog";
import { useCustomerMetricsModal } from "@/hooks/ui/useCustomerMetricsModal";

const UserManagement: React.FC = () => {
  const { data: session } = useSession();

  // 🆕 React Query: Fetch users and SEO devs
  const {
    data: users = [],
    isLoading: loading,
    error: usersError,
  } = useGetUsers(true);
  const { data: seoDevs = [] } = useGetSeoDevs();

  // Use specialized hooks
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
    confirmState,
    handleDeleteUser,
    handleRestoreUser,
    handleConfirmAction,
    handleCloseConfirm,
  } = useUserConfirmDialog();

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
  } = useCustomerMetricsModal(users);

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
          <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
            {usersError.message || "เกิดข้อผิดพลาดในการโหลดข้อมูล"}
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
            onSave={() =>
              handleSaveUser(session?.user as { id: string; role: Role })
            }
            onSavePassword={handlePasswordUpdate}
            onFormChange={handleFormChange}
            seoDevs={seoDevs}
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

        {/* History modals — mount เฉพาะตอนเปิด เพื่อลด render tree */}
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

        <ConfirmAlert
          open={confirmState.isOpen}
          onClose={handleCloseConfirm}
          onConfirm={handleConfirmAction}
          title={confirmState.title}
          message={confirmState.message}
        />
      </Container>
    </DashboardLayout>
  );
};

export default UserManagement;
