'use client'

import React, { Suspense } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { LayoutDashboard, Activity, Search, Sparkles, ClipboardList } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useReportPage } from '@/hooks/ui/useReportPage'
import { HistoryProvider } from './contexts/HistoryContext'
import { ReportFiltersProvider } from './contexts/ReportFiltersContext'
import { OverviewTab } from './tabs/OverviewTab'
import { DomainHealthTab } from './tabs/DomainHealthTab'
import { KeywordPerformanceTab } from './tabs/KeywordPerformanceTab'
import { AiRecommendationsTab } from './tabs/AiRecommendationsTab'
import { WorkProgressTab } from './tabs/WorkProgressTab'
import { ReportSkeleton } from '@/components/skeletons'
import type { CustomerReportData } from '@/hooks/api/useCustomersApi'

interface ReportPageProps {
  customerId: string
  initialData?: CustomerReportData
}

type TabValue = 'overview' | 'health' | 'keywords' | 'ai' | 'work-progress'
const TAB_VALUES: readonly TabValue[] = [
  'overview',
  'health',
  'keywords',
  'ai',
  'work-progress',
] as const
const isTabValue = (v: string | null): v is TabValue =>
  v !== null && (TAB_VALUES as readonly string[]).includes(v)

const ReportTabs = ({
  reportData,
  customerId,
  customerName,
}: {
  reportData: CustomerReportData | undefined
  customerId: string
  customerName: string
}) => {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const rawTab = searchParams.get('tab')
  const activeTab: TabValue = isTabValue(rawTab) ? rawTab : 'overview'

  const handleTabChange = (val: string) => {
    if (!isTabValue(val)) return
    const params = new URLSearchParams(searchParams.toString())
    params.set('tab', val)
    router.replace(`${pathname}?${params.toString()}`, { scroll: false })
  }

  const recommendationsCount = reportData?.recommendations?.length || 0

  return (
    <Tabs
      value={activeTab}
      onValueChange={handleTabChange}
      orientation="vertical"
      className="w-full"
    >
      <div className="grid gap-4 md:grid-cols-[220px_1fr] md:gap-6">
        {/* Sidebar (desktop) + sticky horizontal tabs (mobile) */}
        <aside className="md:contents">
          <div className="bg-background/80 md:border-border md:bg-card sticky top-16 z-20 -mx-4 px-4 py-2 backdrop-blur md:top-20 md:mx-0 md:self-start md:rounded-xl md:border md:p-3 md:backdrop-blur-none">
            <TabsList
              aria-label="SEO Report sections"
              className="bg-muted flex w-full gap-1 overflow-x-auto md:flex-col md:overflow-visible md:bg-transparent md:p-0"
            >
              <TabsTrigger value="overview" className="gap-1.5 md:w-full md:justify-start">
                <LayoutDashboard className="size-4" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="health" className="gap-1.5 md:w-full md:justify-start">
                <Activity className="size-4" />
                Domain Health
              </TabsTrigger>
              <TabsTrigger value="keywords" className="gap-1.5 md:w-full md:justify-start">
                <Search className="size-4" />
                Keyword Performance
              </TabsTrigger>
              <TabsTrigger value="ai" className="gap-1.5 md:w-full md:justify-start">
                <Sparkles className="size-4" />
                AI &amp; Recommendations
              </TabsTrigger>
              <TabsTrigger value="work-progress" className="gap-1.5 md:w-full md:justify-start">
                <ClipboardList className="size-4" />
                Work Progress
              </TabsTrigger>
            </TabsList>
          </div>
        </aside>

        {/* Content area */}
        <div className="min-w-0">
          <TabsContent value="overview" className="mt-0">
            <OverviewTab recommendationsCount={recommendationsCount} />
          </TabsContent>
          <TabsContent value="health" className="mt-0">
            <DomainHealthTab
              customerId={customerId}
              customerName={customerName}
              metrics={reportData?.metrics}
            />
          </TabsContent>
          <TabsContent value="keywords" className="mt-0">
            <KeywordPerformanceTab />
          </TabsContent>
          <TabsContent value="ai" className="mt-0">
            <AiRecommendationsTab
              recommendations={reportData?.recommendations ?? []}
              aiOverviews={reportData?.aiOverviews ?? []}
            />
          </TabsContent>
          <TabsContent value="work-progress" className="mt-0">
            <WorkProgressTab customerId={customerId} />
          </TabsContent>
        </div>
      </div>
    </Tabs>
  )
}

const ReportPage: React.FC<ReportPageProps> = ({ customerId, initialData }) => {
  const { reportData, isLoading, error } = useReportPage(customerId, initialData)

  if (isLoading) {
    return (
      <div className="mx-auto w-full max-w-screen-xl px-4 py-4 md:px-6 md:py-8">
        <ReportSkeleton />
      </div>
    )
  }

  if (error) {
    return (
      <div className="mx-auto w-full max-w-screen-xl px-4 py-8">
        <div
          role="alert"
          className="border-destructive/30 bg-destructive/10 text-destructive rounded-lg border px-4 py-3"
        >
          Failed to load report data: {error}
        </div>
      </div>
    )
  }

  const customerName = reportData?.customerName || 'Customer'
  const domain = reportData?.domain || 'N/A'

  return (
    <HistoryProvider customerId={customerId}>
      <ReportFiltersProvider>
        <div className="mx-auto w-full max-w-screen-xl px-4 py-4 md:px-6 md:py-8">
          <div className="mb-6 md:mb-8">
            <h1 className="mb-1 text-2xl font-bold break-words md:text-4xl">
              SEO Report for {customerName}
            </h1>
            <p className="text-muted-foreground text-base break-words md:text-xl">{domain}</p>
          </div>

          <Suspense fallback={null}>
            <ReportTabs
              reportData={reportData ?? undefined}
              customerId={customerId}
              customerName={customerName}
            />
          </Suspense>
        </div>
      </ReportFiltersProvider>
    </HistoryProvider>
  )
}

export default ReportPage
