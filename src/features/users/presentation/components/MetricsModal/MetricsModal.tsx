'use client'

import React, { useEffect, useMemo, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import {
  Save,
  Clock,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Loader2,
  BarChart3,
  Lightbulb,
  TrendingUp,
  Globe,
  Wand2,
  RefreshCw,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Field } from '@/components/ui/field'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import { User } from '@/types/user'
import {
  OverallMetricsForm,
  KeywordReport,
  KeywordReportForm,
  KeywordRecommend,
  KeywordRecommendForm,
  AiOverview,
} from '@/types'
import { KeywordReportSection } from './KeywordReportSection'
import { RecommendKeywordSection } from './RecommendKeywordSection'
import { useMetricsModal } from '@/hooks/ui/useMetricsModal'
import { usePreviewCustomerMetrics } from '@/features/metrics/presentation/hooks/useAhrefsSync'
import { AhrefsSyncReviewDialog } from '@/features/metrics/presentation/components/AhrefsSyncReviewDialog'
import type { AhrefsFullMetrics } from '@/features/metrics'
import type { AiOverviewSectionHandle } from './AiOverviewSection'
import { ConfirmAlert } from '@/components/shared/ConfirmAlert'
import { StepperNav } from './StepperNav'

// Lazy load — AiOverviewSection has heaviest content (image upload + previews)
const AiOverviewSection = dynamic(
  () => import('./AiOverviewSection').then((m) => m.AiOverviewSection),
  {
    ssr: false,
    loading: () => (
      <div className="space-y-3">
        <Skeleton className="h-44 w-full rounded-2xl" />
        <Skeleton className="h-32 w-full rounded-2xl" />
      </div>
    ),
  },
)

interface MetricsModalProps {
  open: boolean
  onClose: () => void
  customer: User | null
  metricsData: OverallMetricsForm | null
  keywordsData: KeywordReport[]
  onSaveMetrics: (data: Partial<OverallMetricsForm>) => Promise<void>
  onAddKeyword: (data: KeywordReportForm) => Promise<void>
  onDeleteKeyword: (id: string) => Promise<void>
  onUpdateKeyword: (keywordId: string, data: KeywordReportForm) => Promise<void>
  recommendKeywordsData: KeywordRecommend[]
  onAddRecommendKeyword: (data: KeywordRecommendForm) => Promise<void>
  onUpdateRecommendKeyword: (recommendId: string, data: KeywordRecommendForm) => Promise<void>
  onDeleteRecommendKeyword: (id: string) => Promise<void>
  onOpenHistory: () => void
  onOpenKeywordHistory: (keyword: KeywordReport) => void
  isLoadingMetrics?: boolean
  isLoadingKeywords?: boolean
  isLoadingRecommend?: boolean
  aiOverviews?: AiOverview[]
  isLoadingAiOverviews?: boolean
  onAddAiOverview?: (formData: FormData) => Promise<void>
  onUpdateAiOverview?: (id: string, formData: FormData) => Promise<void>
  onDeleteAiOverview?: (aiOverviewId: string) => Promise<void>
}

type MetricsFieldKey = keyof OverallMetricsForm
type MetricsStep = 0 | 1 | 2

interface MetricFieldConfig {
  key: MetricsFieldKey
  label: string
  placeholder: string
  helperText: string
  min?: number
  max?: number
  step?: string | number
}

interface MetricSectionConfig {
  title: string
  description: string
  Icon: typeof BarChart3
  fields: MetricFieldConfig[]
  cols: string
}

const normalizeMetricsForSave = (
  metrics: Record<MetricsFieldKey, string | number>,
): Partial<OverallMetricsForm> =>
  Object.entries(metrics).reduce((acc, [key, value]) => {
    if (value === '') return acc
    return { ...acc, [key]: Number(value) }
  }, {} as Partial<OverallMetricsForm>)

const stepLabels = ['ค่าโดเมน', 'คีย์เวิร์ด', 'AI Overview']

const metricSections: MetricSectionConfig[] = [
  {
    title: 'Authority',
    description: 'ค่าความน่าเชื่อถือและคุณภาพของโดเมน',
    Icon: Wand2,
    fields: [
      {
        key: 'domainRating',
        label: 'Domain Rating',
        placeholder: 'เช่น 42',
        helperText: 'ความแข็งแรงของโดเมน',
        min: 0,
      },
      {
        key: 'healthScore',
        label: 'Health Score',
        placeholder: '0-100',
        helperText: 'คะแนนสุขภาพเว็บไซต์',
        min: 0,
        max: 100,
      },
      {
        key: 'spamScore',
        label: 'Spam Score',
        placeholder: '0-100',
        helperText: 'คะแนนความเสี่ยง (ใส่ทศนิยมได้)',
        min: 0,
        max: 100,
        step: 0.1,
      },
    ],
    cols: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3',
  },
  {
    title: 'Visibility',
    description: 'ตัวเลขที่แสดงการมองเห็นของโดเมน',
    Icon: TrendingUp,
    fields: [
      {
        key: 'organicTraffic',
        label: 'Organic Traffic',
        placeholder: 'เช่น 1200',
        helperText: 'ทราฟฟิกจากการค้นหา',
        min: 0,
      },
      {
        key: 'organicKeywords',
        label: 'Organic Keywords',
        placeholder: 'เช่น 350',
        helperText: 'คีย์เวิร์ดที่ติดอันดับ',
        min: 0,
      },
      {
        key: 'backlinks',
        label: 'Backlinks',
        placeholder: 'เช่น 980',
        helperText: 'ลิงก์ย้อนกลับทั้งหมด',
        min: 0,
      },
      {
        key: 'refDomains',
        label: 'Referring Domains',
        placeholder: 'เช่น 120',
        helperText: 'โดเมนที่ลิงก์กลับมา',
        min: 0,
      },
    ],
    cols: 'grid-cols-1 sm:grid-cols-2',
  },
  {
    title: 'Domain Age',
    description: 'อายุโดเมนเป็นปีและเดือน (เดือน 0-11)',
    Icon: Globe,
    fields: [
      {
        key: 'ageInYears',
        label: 'อายุโดเมน (ปี)',
        placeholder: 'เช่น 2',
        helperText: 'จำนวนปีเต็ม',
        min: 0,
      },
      {
        key: 'ageInMonths',
        label: 'อายุโดเมน (เดือน)',
        placeholder: '0-11',
        helperText: 'เดือนเพิ่มเติม',
        min: 0,
        max: 11,
      },
    ],
    cols: 'grid-cols-1 sm:grid-cols-2',
  },
]

const StepHeader = ({
  Icon,
  title,
  description,
}: {
  Icon: typeof BarChart3
  title: string
  description: string
}) => (
  <div className="border-border flex items-center gap-3 rounded-2xl border p-4">
    <Icon className="text-info size-5" />
    <div>
      <h3 className="font-bold">{title}</h3>
      <p className="text-muted-foreground text-sm">{description}</p>
    </div>
  </div>
)

export const MetricsModal: React.FC<MetricsModalProps> = ({
  open,
  onClose,
  customer,
  metricsData,
  keywordsData,
  onSaveMetrics,
  onAddKeyword,
  onDeleteKeyword,
  onUpdateKeyword,
  recommendKeywordsData,
  onAddRecommendKeyword,
  onUpdateRecommendKeyword,
  onDeleteRecommendKeyword,
  onOpenHistory,
  onOpenKeywordHistory,
  aiOverviews = [],
  isLoadingAiOverviews = false,
  onAddAiOverview,
  onUpdateAiOverview,
  onDeleteAiOverview,
}) => {
  const [activeStep, setActiveStep] = useState<MetricsStep>(0)
  const [aiOverviewDraftState, setAiOverviewDraftState] = useState({
    canSubmit: false,
    isSubmitting: false,
  })
  const [isSavingMetrics, setIsSavingMetrics] = useState(false)
  const [showCloseConfirm, setShowCloseConfirm] = useState(false)
  const [showStepError, setShowStepError] = useState(false)

  const aiOverviewRef = useRef<AiOverviewSectionHandle>(null)
  const previewAhrefs = usePreviewCustomerMetrics()
  const [ahrefsProposed, setAhrefsProposed] = useState<AhrefsFullMetrics | null>(null)
  const [isReviewOpen, setIsReviewOpen] = useState(false)

  const handleSyncFromAhrefs = () => {
    if (!customer) return
    previewAhrefs.mutate(
      { userId: customer.id },
      {
        onSuccess: (result) => {
          setAhrefsProposed(result.fetched)
          setIsReviewOpen(true)
        },
      },
    )
  }

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
  } = useMetricsModal(metricsData)

  useEffect(() => {
    if (!open) {
      setActiveStep(0)
      setShowStepError(false)
    }
  }, [open])

  const metricSummary = useMemo(
    () => [
      { label: 'DR', value: metrics.domainRating === '' ? '-' : metrics.domainRating },
      { label: 'Health', value: metrics.healthScore === '' ? '-' : metrics.healthScore },
      { label: 'Traffic', value: metrics.organicTraffic === '' ? '-' : metrics.organicTraffic },
      { label: 'Ref Domains', value: metrics.refDomains === '' ? '-' : metrics.refDomains },
    ],
    [metrics],
  )

  const handleAddOrUpdateKeyword = async () => {
    if (!newKeyword.keyword.trim()) return
    if (editingKeywordId) {
      await onUpdateKeyword(editingKeywordId, newKeyword)
    } else {
      await onAddKeyword(newKeyword)
    }
    clearEditing()
  }

  const handleAddRecommend = async () => {
    if (!newRecommend.keyword.trim()) return
    if (editingRecommendId) {
      await onUpdateRecommendKeyword(editingRecommendId, newRecommend)
    } else {
      await onAddRecommendKeyword(newRecommend)
    }
    clearRecommendEditing()
  }

  const handleSaveMetrics = async () => {
    if (!isMetricsValid) {
      setShowStepError(true)
      return
    }
    setIsSavingMetrics(true)
    try {
      await onSaveMetrics(normalizeMetricsForSave(metrics))
      markClean()
    } finally {
      setIsSavingMetrics(false)
    }
  }

  const handleStepChange = (step: number) => {
    setActiveStep(step as MetricsStep)
    setShowStepError(false)
  }

  const handleNextStep = () => handleStepChange(Math.min(activeStep + 1, 2))
  const handlePrevStep = () => handleStepChange(Math.max(activeStep - 1, 0))

  const handleRequestClose = () => {
    if (isDirty || aiOverviewDraftState.canSubmit) {
      setShowCloseConfirm(true)
      return
    }
    onClose()
  }

  const handleConfirmClose = () => {
    setShowCloseConfirm(false)
    onClose()
  }

  if (!customer) return null

  return (
    <>
      <Dialog open={open} onOpenChange={(o) => !o && handleRequestClose()}>
        <DialogContent className="max-h-[92vh] max-w-5xl overflow-y-auto sm:max-w-[min(92vw,1100px)]">
          <DialogHeader>
            <div className="flex items-start justify-between gap-3 pr-10">
              <div className="min-w-0 flex-1">
                <DialogTitle className="text-lg md:text-2xl">จัดการข้อมูล Domain</DialogTitle>
                <DialogDescription>
                  ลูกค้า: <span className="text-foreground font-bold">{customer.name}</span>
                </DialogDescription>
              </div>
              <div className="flex items-center gap-1">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="icon-sm"
                      variant="ghost"
                      aria-label="ซิงก์ค่าจาก Ahrefs"
                      onClick={handleSyncFromAhrefs}
                      disabled={previewAhrefs.isPending}
                    >
                      {previewAhrefs.isPending ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : (
                        <RefreshCw className="size-4" />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    ดึง DR / Health / Traffic / Keywords / Backlinks / Ref domains จาก Ahrefs
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="icon-sm"
                      variant="ghost"
                      aria-label="ดูประวัติการเปลี่ยนแปลง"
                      onClick={onOpenHistory}
                    >
                      <Clock className="size-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>ดูประวัติการเปลี่ยนแปลง</TooltipContent>
                </Tooltip>
              </div>
            </div>

            <div className="mt-4">
              <StepperNav
                steps={stepLabels}
                activeStep={activeStep}
                onStepChange={handleStepChange}
              />
            </div>
          </DialogHeader>

          <div className="mt-4 space-y-4">
            {showStepError && !isMetricsValid && activeStep === 0 && (
              <div
                role="alert"
                className="border-destructive/30 bg-destructive/10 text-destructive rounded-md border px-3 py-2 text-sm"
              >
                ข้อมูลไม่ครบหรือไม่ถูกต้อง — โปรดตรวจสอบฟิลด์ที่มีข้อความแดง
              </div>
            )}

            {/* Step 0 — Domain Metrics */}
            {activeStep === 0 && (
              <div className="space-y-4">
                <div className="border-border rounded-2xl border p-4 sm:p-5">
                  <div className="mb-3 flex items-center gap-2">
                    <BarChart3 className="text-info size-5" />
                    <h3 className="font-bold">ภาพรวม</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
                    {metricSummary.map((item) => (
                      <div
                        key={item.label}
                        className="border-border bg-muted/30 rounded-lg border p-3"
                      >
                        <p className="text-muted-foreground text-xs">{item.label}</p>
                        <p className="mt-1 text-base font-bold md:text-xl">{item.value}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-border overflow-hidden rounded-2xl border">
                  {metricSections.map((section, idx) => (
                    <div
                      key={section.title}
                      className={cn('p-4 sm:p-6', idx > 0 && 'border-border border-t')}
                    >
                      <div className="mb-3 flex items-start gap-3">
                        <section.Icon className="text-info size-5" />
                        <div>
                          <h4 className="font-bold">{section.title}</h4>
                          <p className="text-muted-foreground text-sm">{section.description}</p>
                        </div>
                      </div>
                      <div className={cn('grid gap-3', section.cols)}>
                        {section.fields.map((field) => {
                          const hasError = Boolean(validationErrors[field.key])
                          return (
                            <Field key={field.key}>
                              <Label htmlFor={`m-${field.key}`}>{field.label}</Label>
                              <Input
                                id={`m-${field.key}`}
                                name={field.key}
                                placeholder={field.placeholder}
                                type="number"
                                min={field.min}
                                max={field.max}
                                step={field.step}
                                value={metrics[field.key]}
                                onChange={handleMetricsChange}
                                aria-invalid={hasError}
                              />
                              <p
                                className={cn(
                                  'text-xs',
                                  hasError ? 'text-destructive' : 'text-muted-foreground',
                                )}
                              >
                                {validationErrors[field.key] || field.helperText}
                              </p>
                            </Field>
                          )
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Step 1 — Keywords */}
            {activeStep === 1 && (
              <div className="space-y-4">
                <StepHeader
                  Icon={Lightbulb}
                  title="คีย์เวิร์ด"
                  description="คีย์เวิร์ดหลัก + คีย์เวิร์ดแนะนำ"
                />

                <KeywordReportSection
                  newKeyword={newKeyword}
                  keywordsData={keywordsData}
                  editingKeywordId={editingKeywordId}
                  onKeywordChange={handleKeywordChange}
                  onKeywordSelectChange={handleKeywordSelectChange}
                  onAddOrUpdateKeyword={handleAddOrUpdateKeyword}
                  onDeleteKeyword={onDeleteKeyword}
                  onSetEditing={handleSetEditingKeyword}
                  onClearEditing={clearEditing}
                  onViewHistory={onOpenKeywordHistory}
                />

                <RecommendKeywordSection
                  newRecommend={newRecommend}
                  recommendKeywordsData={recommendKeywordsData}
                  editingRecommendId={editingRecommendId}
                  onRecommendChange={handleRecommendChange}
                  onRecommendSelectChange={handleRecommendSelectChange}
                  onAddRecommend={handleAddRecommend}
                  onSetEditingRecommend={handleSetEditingRecommend}
                  onClearEditingRecommend={clearRecommendEditing}
                  onDeleteRecommendKeyword={onDeleteRecommendKeyword}
                />
              </div>
            )}

            {/* Step 2 — AI Overview (lazy) */}
            {activeStep === 2 && (
              <div className="space-y-4">
                <StepHeader
                  Icon={Sparkles}
                  title="AI Overview"
                  description="อัปโหลดรูปประกอบ + หัวข้อ (สูงสุด 3 รูปต่อรายการ)"
                />

                <AiOverviewSection
                  ref={aiOverviewRef}
                  aiOverviews={aiOverviews}
                  isLoading={isLoadingAiOverviews}
                  onAdd={onAddAiOverview || (async () => {})}
                  onUpdate={onUpdateAiOverview || (async () => {})}
                  onDelete={onDeleteAiOverview || (async () => {})}
                  showSubmitButton={false}
                  onStateChange={setAiOverviewDraftState}
                />
              </div>
            )}
          </div>

          {/* Footer actions */}
          <div className="border-border mt-4 flex flex-col-reverse justify-between gap-3 border-t pt-4 sm:flex-row">
            <Button variant="ghost" onClick={handlePrevStep} disabled={activeStep === 0}>
              <ChevronLeft className="size-4" />
              ย้อนกลับ
            </Button>

            <div className="flex flex-col gap-2 sm:flex-row">
              {activeStep === 0 && (
                <Button
                  onClick={handleSaveMetrics}
                  disabled={!isMetricsValid || isSavingMetrics || !isDirty}
                  className="bg-info text-info-foreground hover:bg-info/90"
                >
                  {isSavingMetrics ? <Loader2 className="animate-spin" /> : <Save />}
                  {isSavingMetrics ? 'กำลังบันทึก...' : 'บันทึก Metrics'}
                </Button>
              )}

              {activeStep === 2 && (
                <Button
                  onClick={() => aiOverviewRef.current?.submit()}
                  disabled={!aiOverviewDraftState.canSubmit || aiOverviewDraftState.isSubmitting}
                  className="bg-info text-info-foreground hover:bg-info/90"
                >
                  {aiOverviewDraftState.isSubmitting ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    <Save />
                  )}
                  {aiOverviewDraftState.isSubmitting ? 'กำลังบันทึก...' : 'บันทึก AI Overview'}
                </Button>
              )}

              {activeStep < 2 && (
                <Button variant="outline" onClick={handleNextStep}>
                  ถัดไป
                  <ChevronRight className="size-4" />
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <ConfirmAlert
        open={showCloseConfirm}
        title="ยังไม่ได้บันทึก"
        message="มีข้อมูลที่แก้ไขแต่ยังไม่ได้บันทึก ต้องการปิดและทิ้งการแก้ไขหรือไม่?"
        onConfirm={handleConfirmClose}
        onClose={() => setShowCloseConfirm(false)}
      />

      {ahrefsProposed && (
        <AhrefsSyncReviewDialog
          open={isReviewOpen}
          onOpenChange={setIsReviewOpen}
          userId={customer.id}
          customerName={customer.name ?? ''}
          proposed={ahrefsProposed}
        />
      )}
    </>
  )
}
