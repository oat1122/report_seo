'use client'

import React from 'react'
import { Loader2 } from 'lucide-react'
import { DashboardLayout } from '@/components/Layout/DashboardLayout'
import { useGetManagedCustomers } from '@/hooks/api/useUsersApi'
import {
  useToggleMetricsHistoryVisibility,
  useToggleKeywordHistoryVisibility,
} from '@/hooks/api/useCustomersApi'
import { MetricsModal } from './MetricsModal/MetricsModal'
import { HistoryModal } from './MetricsModal/HistoryModal'
import { KeywordHistoryModal } from './MetricsModal/KeywordHistoryModal'
import { UserTable } from './UserTable'
import { useCustomerMetricsModal } from '@/hooks/ui/useCustomerMetricsModal'

const UserManagementSeoDev: React.FC = () => {
  const {
    data: managedCustomers = [],
    isLoading: loading,
    error: usersError,
  } = useGetManagedCustomers()

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
  } = useCustomerMetricsModal(managedCustomers)

  const toggleMetricsVisibility = useToggleMetricsHistoryVisibility()
  const toggleKeywordVisibility = useToggleKeywordHistoryVisibility()

  return (
    <DashboardLayout>
      <div className="mx-auto w-full max-w-6xl py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Customer Management</h1>
          <p className="text-muted-foreground mt-1 text-sm">จัดการลูกค้าที่อยู่ในความดูแลของคุณ</p>
        </div>

        {usersError && (
          <div
            role="alert"
            className="border-destructive/30 bg-destructive/10 text-destructive mb-4 rounded-lg border px-4 py-3 text-sm"
          >
            {usersError.message || 'เกิดข้อผิดพลาดในการโหลดข้อมูล'}
          </div>
        )}

        {loading ? (
          <div className="flex min-h-96 items-center justify-center">
            <Loader2 className="text-secondary size-10 animate-spin" />
          </div>
        ) : (
          <UserTable
            users={managedCustomers}
            onEdit={() => {}}
            onDelete={() => {}}
            onRestore={() => {}}
            onOpenMetrics={handleOpenMetrics}
            isSeoDevView
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
            customerName={selectedCustomer.name || ''}
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
      </div>
    </DashboardLayout>
  )
}

export default UserManagementSeoDev
