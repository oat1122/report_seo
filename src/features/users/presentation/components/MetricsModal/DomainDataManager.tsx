'use client'

import React, { useMemo, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import {
  Save,
  Clock,
  Sparkles,
  ChevronRight,
  Loader2,
  LayoutGrid,
  TrendingUp,
  Search,
  Lightbulb,
  Globe,
  RefreshCw,
  Check,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Field } from '@/components/ui/field'
import { BackButton } from '@/components/shared/BackButton'
import { cn } from '@/lib/utils'
import type { OverallMetricsForm } from '@/types'
import type { AiOverviewSectionHandle } from './AiOverviewSection'
import { KeywordReportSection } from './KeywordReportSection'
import { RecommendKeywordSection } from './RecommendKeywordSection'
import { HistoryModal } from './HistoryModal'
import { KeywordHistoryModal } from './KeywordHistoryModal'
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
      <div className="space-y-3">
        <Skeleton className="h-44 w-full rounded-2xl" />
        <Skeleton className="h-32 w-full rounded-2xl" />
      </div>
    ),
  },
)

type MetricsFieldKey = keyof OverallMetricsForm
type Section = 'overview' | 'metrics' | 'keywords' | 'recommend' | 'ai'

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
  num: number
  title: string
  description: string
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

const metricSections: MetricSectionConfig[] = [
  {
    num: 1,
    title: 'Authority',
    description: 'ค่าความน่าเชื่อถือและคุณภาพของโดเมน',
    fields: [
      { key: 'domainRating', label: 'Domain Rating', placeholder: 'เช่น 42', helperText: 'ความแข็งแรงของโดเมน', min: 0 },
      { key: 'healthScore', label: 'Health Score', placeholder: '0-100', helperText: 'คะแนนสุขภาพเว็บไซต์', min: 0, max: 100 },
      { key: 'spamScore', label: 'Spam Score', placeholder: '0-100', helperText: 'คะแนนความเสี่ยง (ใส่ทศนิยมได้)', min: 0, max: 100, step: 0.1 },
    ],
    cols: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3',
  },
  {
    num: 2,
    title: 'Visibility',
    description: 'ตัวเลขที่แสดงการมองเห็นของโดเมน',
    fields: [
      { key: 'organicTraffic', label: 'Organic Traffic', placeholder: 'เช่น 1200', helperText: 'ทราฟฟิกจากการค้นหา', min: 0 },
      { key: 'organicKeywords', label: 'Organic Keywords', placeholder: 'เช่น 350', helperText: 'คีย์เวิร์ดที่ติดอันดับ', min: 0 },
      { key: 'backlinks', label: 'Backlinks', placeholder: 'เช่น 980', helperText: 'ลิงก์ย้อนกลับทั้งหมด', min: 0 },
      { key: 'refDomains', label: 'Referring Domains', placeholder: 'เช่น 120', helperText: 'โดเมนที่ลิงก์กลับมา', min: 0 },
    ],
    cols: 'grid-cols-1 sm:grid-cols-2',
  },
  {
    num: 3,
    title: 'Domain Age',
    description: 'อายุโดเมนเป็นปีและเดือน (เดือน 0-11)',
    fields: [
      { key: 'ageInYears', label: 'อายุโดเมน (ปี)', placeholder: 'เช่น 2', helperText: 'จำนวนปีเต็ม', min: 0 },
      { key: 'ageInMonths', label: 'อายุโดเมน (เดือน)', placeholder: '0-11', helperText: 'เดือนเพิ่มเติม', min: 0, max: 11 },
    ],
    cols: 'grid-cols-1 sm:grid-cols-2',
  },
]

const TOTAL_METRIC_FIELDS = metricSections.reduce((n, s) => n + s.fields.length, 0)

const fmt = (value?: number | null) =>
  value === null || value === undefined ? '-' : value.toLocaleString('en-US')

interface DomainDataManagerProps {
  userId: string
  basePath: '/admin' | '/seo'
}

export const DomainDataManager: React.FC<DomainDataManagerProps> = ({ userId, basePath }) => {
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

  const [activeSection, setActiveSection] = useState<Section>('overview')
  const [isSavingMetrics, setIsSavingMetrics] = useState(false)
  const [showMetricsError, setShowMetricsError] = useState(false)
  const [aiDraft, setAiDraft] = useState({ canSubmit: false, isSubmitting: false })

  const aiOverviewRef = useRef<AiOverviewSectionHandle>(null)
  const previewAhrefs = usePreviewCustomerMetrics()
  const [ahrefsProposed, setAhrefsProposed] = useState<AhrefsFullMetrics | null>(null)
  const [isReviewOpen, setIsReviewOpen] = useState(false)

  const toggleMetricsVisibility = useToggleMetricsHistoryVisibility()
  const toggleKeywordVisibility = useToggleKeywordHistoryVisibility()

  const kwCount = data.keywords.length
  const topCount = useMemo(
    () => data.keywords.filter((k) => k.isTopReport).length,
    [data.keywords],
  )
  const recCount = data.recommendKeywords.length
  const aiCount = data.aiOverviews.length

  const filledCount = useMemo(
    () => metricSections.flatMap((s) => s.fields).filter((f) => metrics[f.key] !== '').length,
    [metrics],
  )
  const completeness = Math.round((filledCount / TOTAL_METRIC_FIELDS) * 100)

  const kpis = useMemo(
    () => [
      { label: 'Domain Rating', value: fmt(data.metrics?.domainRating), sub: 'ความแข็งแรงของโดเมน' },
      { label: 'Health Score', value: fmt(data.metrics?.healthScore), sub: 'คะแนนสุขภาพเว็บไซต์' },
      { label: 'Organic Traffic', value: fmt(data.metrics?.organicTraffic), sub: 'ทราฟฟิกจากการค้นหา' },
      { label: 'Organic Keywords', value: fmt(data.metrics?.organicKeywords), sub: 'คีย์เวิร์ดที่ติดอันดับ' },
      { label: 'Backlinks', value: fmt(data.metrics?.backlinks), sub: 'ลิงก์ย้อนกลับทั้งหมด' },
      { label: 'Referring Domains', value: fmt(data.metrics?.refDomains), sub: 'โดเมนที่ลิงก์กลับมา' },
    ],
    [data.metrics],
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

  const navItems: { key: Section; label: string; Icon: typeof LayoutGrid; count?: number }[] = [
    { key: 'overview', label: 'ภาพรวม', Icon: LayoutGrid },
    { key: 'metrics', label: 'ค่าโดเมน', Icon: TrendingUp },
    { key: 'keywords', label: 'Keyword Report', Icon: Search, count: kwCount },
    { key: 'recommend', label: 'Keyword แนะนำ', Icon: Lightbulb, count: recCount },
    { key: 'ai', label: 'AI Overview', Icon: Sparkles, count: aiCount },
  ]

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6">
      {/* ── HEADER ── */}
      <header className="mb-6">
        <nav className="text-muted-foreground mb-3 flex items-center gap-2 text-sm">
          <Link href={`${basePath}/users`} className="hover:text-foreground">
            ผู้ใช้งาน
          </Link>
          <ChevronRight className="size-3.5" />
          <span>ลูกค้า</span>
          <ChevronRight className="size-3.5" />
          <span className="text-foreground font-semibold">จัดการข้อมูล Domain</span>
        </nav>

        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <BackButton fallbackHref={`${basePath}/users`} />
            <div className="min-w-0">
              <h1 className="text-2xl font-bold tracking-tight md:text-3xl">จัดการข้อมูล Domain</h1>
              <div className="mt-1 flex flex-wrap items-center gap-3">
                <span className="text-muted-foreground text-sm">
                  ลูกค้า:{' '}
                  <span className="text-foreground font-semibold">{data.customerName || '—'}</span>
                </span>
                {data.domain && (
                  <span className="bg-info/10 text-info inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium">
                    <Globe className="size-3.5" />
                    {data.domain}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="default"
              className="bg-primary text-primary-foreground hover:bg-primary/90"
              onClick={handleSyncFromAhrefs}
              disabled={previewAhrefs.isPending}
            >
              {previewAhrefs.isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <RefreshCw className="size-4" />
              )}
              ซิงก์จาก Ahrefs
            </Button>
            <Button variant="outline" onClick={data.openHistory}>
              <Clock className="size-4" />
              ประวัติ
            </Button>
          </div>
        </div>
      </header>

      {/* ── BODY: sidebar + main ── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[240px_1fr] lg:items-start">
        {/* sidebar nav */}
        <aside className="border-border bg-card flex gap-1 overflow-x-auto rounded-2xl border p-2 lg:sticky lg:top-6 lg:flex-col lg:overflow-visible lg:p-3">
          <p className="text-muted-foreground hidden px-2 pt-1 pb-2 text-[11px] font-semibold tracking-wider uppercase lg:block">
            หมวดข้อมูล
          </p>
          {navItems.map(({ key, label, Icon, count }) => {
            const isActive = activeSection === key
            return (
              <button
                key={key}
                type="button"
                onClick={() => setActiveSection(key)}
                className={cn(
                  'flex shrink-0 items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-info/10 text-info'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                )}
              >
                <Icon className="size-[18px]" />
                <span className="flex-1 text-left whitespace-nowrap">{label}</span>
                {key === 'metrics' && isDirty && (
                  <span className="bg-warning size-2 rounded-full" aria-hidden />
                )}
                {count !== undefined && (
                  <span className="bg-muted text-muted-foreground rounded-md px-1.5 py-0.5 text-xs font-semibold">
                    {count}
                  </span>
                )}
              </button>
            )
          })}

          <div className="border-border mx-2 mt-2 hidden border-t pt-3 lg:block">
            <div className="text-muted-foreground mb-1.5 flex justify-between text-xs">
              <span>ความครบถ้วน</span>
              <span className="text-foreground font-semibold">{completeness}%</span>
            </div>
            <div className="bg-muted h-1.5 overflow-hidden rounded-full">
              <div
                className="bg-info h-full rounded-full transition-all"
                style={{ width: `${completeness}%` }}
              />
            </div>
          </div>
        </aside>

        {/* main content */}
        <main className="min-w-0">
          {/* OVERVIEW */}
          {activeSection === 'overview' && (
            <section className="space-y-5">
              <div className="bg-primary text-primary-foreground flex items-center gap-4 rounded-2xl p-5">
                <div className="bg-info/20 flex size-11 shrink-0 items-center justify-center rounded-xl">
                  <RefreshCw className="text-info-foreground size-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold">ดึงข้อมูลอัตโนมัติจาก Ahrefs</p>
                  <p className="text-primary-foreground/70 mt-0.5 text-sm">
                    ไม่ต้องกรอกเอง — ดึง DR, Health, Traffic, Keywords, Backlinks, Ref Domains
                    มาให้พร้อมตรวจทาน
                  </p>
                </div>
                <Button
                  className="bg-info text-info-foreground hover:bg-info/90"
                  onClick={handleSyncFromAhrefs}
                  disabled={previewAhrefs.isPending}
                >
                  {previewAhrefs.isPending && <Loader2 className="size-4 animate-spin" />}
                  ซิงก์เลย
                </Button>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {kpis.map((k) => (
                  <div key={k.label} className="border-border bg-card rounded-2xl border p-5">
                    <div className="mb-3 flex items-center gap-2">
                      <span className="bg-info size-2 rounded-full" aria-hidden />
                      <p className="text-muted-foreground text-sm font-medium">{k.label}</p>
                    </div>
                    <p className="text-3xl font-bold tracking-tight">{k.value}</p>
                    <p className="text-muted-foreground mt-2 text-xs">{k.sub}</p>
                  </div>
                ))}
              </div>

              <div className="border-border bg-card rounded-2xl border p-6">
                <h3 className="text-lg font-bold">สรุปคีย์เวิร์ด</h3>
                <p className="text-muted-foreground mt-0.5 mb-4 text-sm">
                  ภาพรวมคีย์เวิร์ดที่ติดตามและที่แนะนำ
                </p>
                <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                  {[
                    { label: 'Keyword Report', value: kwCount, accent: false },
                    { label: 'ติด Top Report', value: topCount, accent: false },
                    { label: 'Keyword แนะนำ', value: recCount, accent: true },
                    { label: 'AI Overview', value: aiCount, accent: false },
                  ].map((s) => (
                    <div key={s.label} className="border-border rounded-xl border p-4">
                      <p className={cn('text-2xl font-bold', s.accent && 'text-warning')}>
                        {s.value}
                      </p>
                      <p className="text-muted-foreground mt-1 text-xs">{s.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* METRICS */}
          {activeSection === 'metrics' && (
            <section className="space-y-4 pb-20">
              <div>
                <h2 className="text-xl font-bold">ค่าโดเมน</h2>
                <p className="text-muted-foreground mt-1 text-sm">
                  กรอกตัวเลขที่ได้จากเครื่องมือ SEO — แบ่งเป็น 3 กลุ่มให้กรอกง่ายขึ้น
                </p>
              </div>

              {showMetricsError && !isMetricsValid && (
                <div
                  role="alert"
                  className="border-destructive/30 bg-destructive/10 text-destructive rounded-md border px-3 py-2 text-sm"
                >
                  ข้อมูลไม่ครบหรือไม่ถูกต้อง — โปรดตรวจสอบฟิลด์ที่มีข้อความแดง
                </div>
              )}

              {metricSections.map((section) => (
                <div key={section.title} className="border-border bg-card rounded-2xl border p-5 sm:p-6">
                  <div className="mb-4 flex items-center gap-3">
                    <span className="bg-info/10 text-info flex size-8 items-center justify-center rounded-lg text-sm font-bold">
                      {section.num}
                    </span>
                    <div>
                      <h3 className="font-bold">{section.title}</h3>
                      <p className="text-muted-foreground text-sm">{section.description}</p>
                    </div>
                  </div>
                  <div className={cn('grid gap-4', section.cols)}>
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

              {/* sticky save bar */}
              {isDirty && (
                <div className="border-border bg-card sticky bottom-4 flex items-center justify-between gap-4 rounded-2xl border px-4 py-3 shadow-lg">
                  <span className="text-muted-foreground inline-flex items-center gap-2 text-sm">
                    <span className="bg-warning size-2 rounded-full" aria-hidden />
                    มีการแก้ไข{' '}
                    <strong className="text-foreground">{filledCount}</strong> ฟิลด์ ยังไม่ได้บันทึก
                  </span>
                  <Button
                    onClick={handleSaveMetrics}
                    disabled={!isMetricsValid || isSavingMetrics}
                    className="bg-info text-info-foreground hover:bg-info/90"
                  >
                    {isSavingMetrics ? <Loader2 className="animate-spin" /> : <Save />}
                    {isSavingMetrics ? 'กำลังบันทึก...' : 'บันทึก Metrics'}
                  </Button>
                </div>
              )}
              {!isDirty && data.metrics && (
                <div className="bg-success/10 text-success inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium">
                  <Check className="size-4" />
                  บันทึกข้อมูลล่าสุดเรียบร้อย
                </div>
              )}
            </section>
          )}

          {/* KEYWORDS */}
          {activeSection === 'keywords' && (
            <section className="space-y-4">
              <div>
                <h2 className="text-xl font-bold">Keyword Report</h2>
                <p className="text-muted-foreground mt-1 text-sm">
                  คีย์เวิร์ดหลักที่ติดตาม พร้อมอันดับ ทราฟฟิก และระดับความยาก
                </p>
              </div>
              <KeywordReportSection
                customerId={userId}
                newKeyword={newKeyword}
                keywordsData={data.keywords}
                editingKeywordId={editingKeywordId}
                onKeywordChange={handleKeywordChange}
                onKeywordSelectChange={handleKeywordSelectChange}
                onAddOrUpdateKeyword={handleAddOrUpdateKeyword}
                onDeleteKeyword={data.handleDeleteKeyword}
                onSetEditing={handleSetEditingKeyword}
                onClearEditing={clearEditing}
                onViewHistory={data.openKeywordHistory}
              />
            </section>
          )}

          {/* RECOMMEND */}
          {activeSection === 'recommend' && (
            <section className="space-y-4">
              <div>
                <h2 className="text-xl font-bold">Keyword แนะนำ</h2>
                <p className="text-muted-foreground mt-1 text-sm">
                  คีย์เวิร์ดที่แนะนำให้ลูกค้าทำต่อ พร้อมระดับความยากและหมายเหตุ
                </p>
              </div>
              <RecommendKeywordSection
                newRecommend={newRecommend}
                recommendKeywordsData={data.recommendKeywords}
                editingRecommendId={editingRecommendId}
                onRecommendChange={handleRecommendChange}
                onRecommendSelectChange={handleRecommendSelectChange}
                onAddRecommend={handleAddRecommend}
                onSetEditingRecommend={handleSetEditingRecommend}
                onClearEditingRecommend={clearRecommendEditing}
                onDeleteRecommendKeyword={data.handleDeleteRecommendKeyword}
              />
            </section>
          )}

          {/* AI OVERVIEW */}
          {activeSection === 'ai' && (
            <section className="space-y-4">
              <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                  <h2 className="text-xl font-bold">AI Overview</h2>
                  <p className="text-muted-foreground mt-1 text-sm">
                    บันทึกหัวข้อและภาพประกอบที่ติด AI Overview (สูงสุด 3 รูปต่อรายการ)
                  </p>
                </div>
                <Button
                  onClick={() => aiOverviewRef.current?.submit()}
                  disabled={!aiDraft.canSubmit || aiDraft.isSubmitting}
                  className="bg-info text-info-foreground hover:bg-info/90"
                >
                  {aiDraft.isSubmitting ? <Loader2 className="animate-spin" /> : <Save />}
                  {aiDraft.isSubmitting ? 'กำลังบันทึก...' : 'บันทึก AI Overview'}
                </Button>
              </div>
              <AiOverviewSection
                ref={aiOverviewRef}
                aiOverviews={data.aiOverviews}
                isLoading={data.isLoadingAiOverviews}
                onAdd={data.handleAddAiOverview}
                onUpdate={data.handleUpdateAiOverview}
                onDelete={data.handleDeleteAiOverview}
                showSubmitButton={false}
                onStateChange={setAiDraft}
              />
            </section>
          )}
        </main>
      </div>

      {/* modals */}
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
    </div>
  )
}
