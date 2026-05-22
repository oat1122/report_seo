"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, Loader2, Plus } from "lucide-react";
import { useSession } from "next-auth/react";
import { useGetUsers, useGetSeoDevs } from "@/hooks/api/useUsersApi";
import {
  useToggleMetricsHistoryVisibility,
  useToggleKeywordHistoryVisibility,
} from "@/hooks/api/useCustomersApi";
import { Role } from "@/types/auth";
import { Button } from "@/components/ui/button";
import { DashboardLayout } from "@/components/Layout/DashboardLayout";
import { UserTable } from "./UserTable";
import { UserModal } from "./UserModal";
import { MetricsModal } from "./MetricsModal/MetricsModal";
import { HistoryModal } from "./MetricsModal/HistoryModal";
import { KeywordHistoryModal } from "./MetricsModal/KeywordHistoryModal";
import { ConfirmAlert } from "@/components/shared/ConfirmAlert";
import { useUserModalLogic } from "@/hooks/ui/useUserModalLogic";
import { useUserConfirmDialog } from "@/hooks/ui/useUserConfirmDialog";
import { useCustomerMetricsModal } from "@/hooks/ui/useCustomerMetricsModal";

const UserManagement: React.FC = () => {
  const { data: session } = useSession();

  const {
    data: users = [],
    isLoading: loading,
    error: usersError,
  } = useGetUsers(true);
  const { data: seoDevs = [] } = useGetSeoDevs();

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
      <div className="mx-auto w-full max-w-6xl py-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Button asChild variant="ghost" size="icon">
              <Link href="/admin">
                <ArrowLeft className="size-4" />
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
                การจัดการผู้ใช้งาน
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                จัดการบัญชีผู้ใช้งานทั้งหมดในระบบ
              </p>
            </div>
          </div>
          <Button
            size="lg"
            onClick={() => handleOpenUserModal()}
            className="bg-secondary text-secondary-foreground hover:bg-secondary/90"
          >
            <Plus className="size-4" />
            เพิ่มผู้ใช้งาน
          </Button>
        </div>

        {usersError && (
          <div
            role="alert"
            className="mb-4 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
          >
            {usersError.message || "เกิดข้อผิดพลาดในการโหลดข้อมูล"}
          </div>
        )}

        {loading ? (
          <div className="flex min-h-96 items-center justify-center">
            <Loader2 className="size-10 animate-spin text-secondary" />
          </div>
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
      </div>
    </DashboardLayout>
  );
};

export default UserManagement;
