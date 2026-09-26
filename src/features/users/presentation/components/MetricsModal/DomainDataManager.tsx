'use client'

import React, { useMemo, useState } from 'react'
import dynamic from 'next/dynamic'
import { History, Loader2, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { AnimatePresence, FadeSwap } from '@/components/motion'
import type { OverallMetricsForm } from '@/types'
import { KeywordReportSection } from './KeywordReportSection'
import { RecommendKeywordSection } from './RecommendKeywordSection'
import { NextStepsManager } from '@/features/next-steps/presentation/components/NextStepsManager'
import { HistoryModal } from './HistoryModal'
import { KeywordHistoryModal } from './KeywordHistoryModal'
import { DomainSectionNav, type DomainNavItem, type DomainSection } from './DomainSectionNav'
import { DomainOverviewSection } from './DomainOverviewSection'
import { DomainMetricsSection } from './DomainMetricsSection'
import { SectionHeading } from './SectionHeading'
import { ALL_METRIC_FIELDS, type MetricsFieldKey } from './domainMetricFields'
import { useMetricsModal } from '@/hooks/ui/useMetricsModal'
import { useDomainData } from '@/hooks/ui/useDomainData'
import {
  useToggleMetricsHistoryVisibility,
  useToggleKeywordHistoryVisibility,
} from '@/hooks/api/useCustomersApi'
import { usePreviewCustomerMetrics } from '@/features/metrics/presentation/hooks/useAhrefsSync'
import { AhrefsSyncReviewDialog } from '@/features/metrics/presentation/components/AhrefsSyncReviewDialog'
import type { AhrefsFullMetrics } from '@/features/metrics'

// Lazy load — AiOverviewSection มีเนื้อหาหนักสุด (อัปโหลดรูป + preview)
const AiOverviewSection = dynamic(
  () => import('./AiOverviewSection').then((m) => m.AiOverviewSection),
  {
    ssr: false,
    loading: () => (
      <div className="flex flex-col gap-[18px]" aria-busy="true" aria-label="กำลังโหลด AI Overview">
        <Skeleton className="h-12 w-full rounded-2xl" />
        <Skeleton className="h-56 w-full rounded-[20px]" />
      </div>
    ),
  },
)

const normalizeMetricsForSave = (
  metrics: Record<MetricsFieldKey, string | number>,
): Partial<OverallMetricsForm> =>
  Object.entries(metrics).reduce((acc, [key, value]) => {
    if (value === '') return acc
    return { ...acc, [key]: Number(value) }
  }, {} as Partial<OverallMetricsForm>)

interface DomainDataManagerProps {
  userId: string
}

/**
 * เนื้อหาแท็บ "ข้อมูล Domain" ของ workspace ลูกค้า (admin + seo)
 * หัว workspace (ชื่อลูกค้า/แท็บ) อยู่ที่ page ผ่าน CustomerWorkspaceHeader
 */
export const DomainDataManager: React.FC<DomainDataManagerProps> = ({ userId }) => {
  const data = useDomainData(userId)
  const {
    metrics,
    newKeyword,
    newRecommend,
    editingKeywordId,
    editingRecommendId,
    validationErrors,
    isMetricsValid,
    isDirty,
    markClean,
    handleMetricsChange,
    handleKeywordChange,
    handleKeywordSelectChange,
    handleRecommendChange,
    handleRecommendSelectChange,
    handleSetEditingKeyword,
    handleSetEditingRecommend,
    clearEditing,
    clearRecommendEditing,
  } = useMetricsModal(data.metrics)

  const [activeSection, setActiveSection] = useState<DomainSection>('overview')
  const [isSavingMetrics, setIsSavingMetrics] = useState(false)
  const [showMetricsError, setShowMetricsError] = useState(false)

  const previewAhrefs = usePreviewCustomerMetrics()
  const [ahrefsProposed, setAhrefsProposed] = useState<AhrefsFullMetrics | null>(null)
  const [isReviewOpen, setIsReviewOpen] = useState(false)

  const toggleMetricsVisibility = useToggleMetricsHistoryVisibility()
  const toggleKeywordVisibility = useToggleKeywordHistoryVisibility()

  const kwCount = data.keywords.length
  const topCount = useMemo(() => data.keywords.filter((k) => k.isTopReport).length, [data.keywords])
  const recCount = data.recommendKeywords.length
  const aiCount = data.aiOverviews.length

  const missingFields = useMemo(
    () => ALL_METRIC_FIELDS.filter((f) => metrics[f.key] === ''),
    [metrics],
  )
  const completeness = Math.round(
    ((ALL_METRIC_FIELDS.length - missingFields.length) / ALL_METRIC_FIELDS.length) * 100,
  )

  const handleSyncFromAhrefs = () => {
    previewAhrefs.mutate(
      { userId },
      {
        onSuccess: (result) => {
          setAhrefsProposed(result.fetched)
          setIsReviewOpen(true)
        },
      },
    )
  }

  const handleSaveMetrics = async () => {
    if (!isMetricsValid) {
      setShowMetricsError(true)
      return
    }
    setShowMetricsError(false)
    setIsSavingMetrics(true)
    try {
      await data.handleSaveMetrics(normalizeMetricsForSave(metrics))
      markClean()
    } finally {
      setIsSavingMetrics(false)
    }
  }

  const handleAddOrUpdateKeyword = async () => {
    if (!newKeyword.keyword.trim()) return
    if (editingKeywordId) {
      await data.handleUpdateKeyword(editingKeywordId, newKeyword)
    } else {
      await data.handleAddKeyword(newKeyword)
    }
    clearEditing()
  }

  const handleAddRecommend = async () => {
    if (!newRecommend.keyword.trim()) return
    if (editingRecommendId) {
      await data.handleUpdateRecommendKeyword(editingRecommendId, newRecommend)
    } else {
      await data.handleAddRecommendKeyword(newRecommend)
    }
    clearRecommendEditing()
  }

  const navItems: DomainNavItem[] = [
    { key: 'overview', label: 'ภาพรวม' },
    { key: 'metrics', label: 'ค่าโดเมน', dirty: isDirty },
    {
      key: 'keywords',
      label: 'Keyword Report',
      count: data.isLoadingKeywords ? undefined : kwCount,
    },
    {
      key: 'recommend',
      label: 'Keyword แนะนำ',
      count: data.isLoadingRecommend ? undefined : recCount,
    },
    { key: 'next-steps', label: 'แนะนำให้ทำต่อ' },
    { key: 'ai', label: 'AI Overview', count: data.isLoadingAiOverviews ? undefined : aiCount },
  ]

  const historyButton = (label: string) => (
    <Button variant="outline" onClick={data.openHistory}>
      <History />
      {label}
    </Button>
  )

  const renderSection = () => {
    switch (activeSection) {
      case 'overview':
        return (
          <>
            <SectionHeading
              title="ภาพรวม"
              description={
                data.metrics || data.isLoadingMetrics
                  ? 'ค่าชุดนี้คือสิ่งที่ลูกค้าเห็นในรายงาน'
                  : 'ยังไม่มีค่าโดเมนที่บันทึกไว้ · ซิงก์จาก Ahrefs หรือกรอกเองในหมวดค่าโดเมน'
              }
            >
              {historyButton('ประวัติการเปลี่ยนแปลง')}
            </SectionHeading>
            <DomainOverviewSection
              metrics={data.metrics}
              isLoading={data.isLoadingMetrics}
              counts={{ keywords: kwCount, top: topCount, recommend: recCount, ai: aiCount }}
              isSyncing={previewAhrefs.isPending}
              syncFailed={previewAhrefs.isError}
              onSync={handleSyncFromAhrefs}
              onNavigate={setActiveSection}
            />
          </>
        )
      case 'metrics':
        return (
          <>
            <SectionHeading
              title="ค่าโดเมน"
              description="กรอกตัวเลขจากเครื่องมือ SEO หรือซิงก์จาก Ahrefs — แบ่งเป็น 3 กลุ่มให้กรอกง่ายขึ้น"
            >
              <Button
                variant="outline"
                onClick={handleSyncFromAhrefs}
                disabled={previewAhrefs.isPending}
              >
                {previewAhrefs.isPending ? <Loader2 className="animate-spin" /> : <RefreshCw />}
                ซิงก์จาก Ahrefs
              </Button>
              {historyButton('ประวัติ')}
            </SectionHeading>
            <DomainMetricsSection
              metrics={metrics}
              validationErrors={validationErrors}
              isMetricsValid={isMetricsValid}
              showError={showMetricsError}
              isDirty={isDirty}
              hasSavedMetrics={Boolean(data.metrics)}
              isSaving={isSavingMetrics}
              onChange={handleMetricsChange}
              onSave={handleSaveMetrics}
            />
          </>
        )
      case 'keywords':
        return (
          <>
            <SectionHeading
              title="Keyword Report"
              description="Keyword ที่ลูกค้าเห็นในรายงาน · ★ = แสดงใน Top Report"
            >
              {historyButton('ประวัติทั้งหมด')}
            </SectionHeading>
            <KeywordReportSection
              customerId={userId}
              newKeyword={newKeyword}
              keywordsData={data.keywords}
              isLoading={data.isLoadingKeywords}
              editingKeywordId={editingKeywordId}
              onKeywordChange={handleKeywordChange}
              onKeywordSelectChange={handleKeywordSelectChange}
              onAddOrUpdateKeyword={handleAddOrUpdateKeyword}
              onDeleteKeyword={data.handleDeleteKeyword}
              onSetEditing={handleSetEditingKeyword}
              onClearEditing={clearEditing}
              onViewHistory={data.openKeywordHistory}
            />
          </>
        )
      case 'recommend':
        return (
          <>
            <SectionHeading
              title="Keyword แนะนำ"
              description="Keyword ที่แนะนำให้ลูกค้าทำต่อ พร้อมระดับความยากและหมายเหตุ"
            />
            <RecommendKeywordSection
              newRecommend={newRecommend}
              recommendKeywordsData={data.recommendKeywords}
              isLoading={data.isLoadingRecommend}
              editingRecommendId={editingRecommendId}
              onRecommendChange={handleRecommendChange}
              onRecommendSelectChange={handleRecommendSelectChange}
              onAddRecommend={handleAddRecommend}
              onSetEditingRecommend={handleSetEditingRecommend}
              onClearEditingRecommend={clearRecommendEditing}
              onDeleteRecommendKeyword={data.handleDeleteRecommendKeyword}
            />
          </>
        )
      case 'next-steps':
        return (
          <>
            <SectionHeading
              title="แนะนำให้ทำต่อ"
              description="รายการ action ที่อยากแนะนำให้ลูกค้าทำต่อ — โชว์เป็นการ์ดบนสุดของหน้ารายงานลูกค้า"
            />
            <NextStepsManager customerId={userId} />
          </>
        )
      case 'ai':
        return (
          <AiOverviewSection
            aiOverviews={data.aiOverviews}
            isLoading={data.isLoadingAiOverviews}
            customerName={data.customerName}
            onAdd={data.handleAddAiOverview}
            onUpdate={data.handleUpdateAiOverview}
            onDelete={data.handleDeleteAiOverview}
          />
        )
    }
  }

  return (
    <>
      <div className="grid grid-cols-1 gap-[18px] xl:grid-cols-[240px_minmax(0,1fr)] xl:items-start">
        <DomainSectionNav
          items={navItems}
          active={activeSection}
          onSelect={setActiveSection}
          completeness={completeness}
          missingLabels={missingFields.map((f) => f.label)}
        />

        {/* @container — ตาราง/grid ด้านในเลือก layout ตามความกว้างคอลัมน์นี้ ไม่ใช่ความกว้างจอ */}
        <div className="@container min-w-0">
          <AnimatePresence mode="wait" initial={false}>
            <FadeSwap
              key={activeSection}
              exit={{ opacity: 0, transition: { duration: 0.12 } }}
              className="flex flex-col gap-[18px]"
            >
              {renderSection()}
            </FadeSwap>
          </AnimatePresence>
        </div>
      </div>

      <HistoryModal
        open={data.isHistoryOpen}
        onClose={data.closeHistory}
        history={data.historyData.metricsHistory}
        keywordHistory={data.historyData.keywordHistory}
        customerName={data.customerName}
        isLoading={data.isLoadingCombinedHistory}
        canManage
        onToggleMetricsVisibility={(payload) =>
          toggleMetricsVisibility.mutate({ customerId: userId, ...payload })
        }
        onToggleKeywordVisibility={(payload) =>
          toggleKeywordVisibility.mutate({ customerId: userId, ...payload })
        }
      />

      {data.selectedKeyword && data.isKeywordHistoryOpen && (
        <KeywordHistoryModal
          open={data.isKeywordHistoryOpen}
          onClose={data.closeKeywordHistory}
          history={data.keywordHistory}
          keywordName={data.selectedKeyword.keyword}
          isLoading={data.isLoadingSpecificHistory}
        />
      )}

      {ahrefsProposed && (
        <AhrefsSyncReviewDialog
          open={isReviewOpen}
          onOpenChange={setIsReviewOpen}
          userId={userId}
          customerName={data.customerName}
          proposed={ahrefsProposed}
        />
      )}
    </>
  )
}
