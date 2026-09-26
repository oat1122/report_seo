'use client'

import React, { Suspense, type ReactNode } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useSession } from 'next-auth/react'
import {
  Activity,
  CircleAlert,
  ClipboardList,
  Globe,
  LayoutDashboard,
  RefreshCw,
  Search,
  Sparkles,
} from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { EASE_OUT, FadeSwap, motion } from '@/components/motion'
import { initialsOf } from '@/components/Layout/AppSidebar'
import { ReportSkeleton } from '@/components/skeletons'
import { ExportReportMenu } from '@/features/customer-hub/presentation/components/ExportReportMenu'
import { useReportPage } from '@/hooks/ui/useReportPage'
import { cn } from '@/lib/utils'
import { Role } from '@/types/auth'
import type { CustomerReportData } from '@/hooks/api/useCustomersApi'
import { HistoryProvider } from './contexts/HistoryContext'
import { ReportFiltersProvider } from './contexts/ReportFiltersContext'
import { PeriodSegmented } from './components/PeriodSegmented'
import { isReportTab, type ReportTab } from './hooks/useReportTabHref'
import { OverviewTab } from './tabs/OverviewTab'
import { DomainHealthTab } from './tabs/DomainHealthTab'
import { KeywordPerformanceTab } from './tabs/KeywordPerformanceTab'
import { AiRecommendationsTab } from './tabs/AiRecommendationsTab'
import { WorkProgressTab } from './tabs/WorkProgressTab'

interface ReportPageProps {
  customerId: string
  initialData?: CustomerReportData
}

const SECTIONS: { value: ReportTab; short: string; full: string; icon: typeof Activity }[] = [
  { value: 'overview', short: 'Overview', full: 'Overview', icon: LayoutDashboard },
  { value: 'health', short: 'Health', full: 'Domain Health', icon: Activity },
  { value: 'keywords', short: 'Keywords', full: 'Keyword Performance', icon: Search },
  { value: 'ai', short: 'AI', full: 'AI & Recommendations', icon: Sparkles },
  { value: 'work-progress', short: 'Work', full: 'Work Progress', icon: ClipboardList },
]

/** หัวหน้ารายงาน: avatar + คำทักทาย (เฉพาะลูกค้า) + ชื่อ + โดเมน */
const ReportIdentity = ({
  customerName,
  domain,
  isCustomer,
  className,
}: {
  customerName: string
  domain: string | null
  isCustomer: boolean
  className?: string
}) => (
  <div className={cn('flex min-w-0 items-center gap-3.5', className)}>
    <span
      aria-hidden
      className="bg-info-subtle border-background shadow-card hidden size-[50px] shrink-0 items-center justify-center rounded-full border-2 text-[17px] font-semibold sm:flex"
    >
      {initialsOf(customerName)}
    </span>
    <div className="flex min-w-0 flex-col gap-1.5 sm:gap-0.5">
      <span className="text-text-secondary text-[13px]">
        {isCustomer ? 'ยินดีต้อนรับกลับมา' : 'รายงานของลูกค้า'}
      </span>
      <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-center sm:gap-3.5">
        <h1 className="text-[26px] leading-tight font-semibold break-words md:text-[28px]">
          {customerName}
        </h1>
        {domain && (
          <span className="border-glass-border text-text-secondary inline-flex h-8 w-fit max-w-full min-w-0 items-center gap-1.5 rounded-full border bg-white/70 px-3 text-[13px] dark:bg-white/5">
            <Globe aria-hidden className="size-3.5 shrink-0" />
            <span className="truncate">{domain}</span>
          </span>
        )}
      </div>
    </div>
  </div>
)

const ReportTabs = ({
  reportData,
  customerId,
  customerName,
  domain,
}: {
  reportData: CustomerReportData | undefined
  customerId: string
  customerName: string
  domain: string | null
}) => {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { data: session } = useSession()
  const rawTab = searchParams.get('tab')
  const activeTab: ReportTab = isReportTab(rawTab) ? rawTab : 'overview'

  // ลูกค้า: sidebar ของ shell มีเมนู 5 ส่วนอยู่แล้วบน desktop → ซ่อนแถบแท็บของหน้า (md+)
  // ระหว่างรอ session ใช้ path เดา (/customer/report = ลูกค้าเท่านั้น)
  const role = session?.user?.role as Role | undefined
  const isCustomer = role ? role === Role.CUSTOMER : pathname === '/customer/report'

  const handleTabChange = (val: string) => {
    if (!isReportTab(val)) return
    const params = new URLSearchParams(searchParams.toString())
    params.set('tab', val)
    router.replace(`${pathname}?${params.toString()}`, { scroll: false })
  }

  const recommendationsCount = reportData?.recommendations?.length || 0

  const panels: Record<ReportTab, ReactNode> = {
    overview: <OverviewTab customerId={customerId} recommendationsCount={recommendationsCount} />,
    health: (
      <DomainHealthTab
        customerId={customerId}
        customerName={customerName}
        metrics={reportData?.metrics}
      />
    ),
    keywords: <KeywordPerformanceTab />,
    ai: (
      <AiRecommendationsTab
        recommendations={reportData?.recommendations ?? []}
        aiOverviews={reportData?.aiOverviews ?? []}
      />
    ),
    'work-progress': <WorkProgressTab customerId={customerId} />,
  }

  return (
    <Tabs value={activeTab} onValueChange={handleTabChange} className="flex w-full flex-col gap-5">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-[minmax(0,1fr)_auto] md:items-center md:gap-x-6">
        <ReportIdentity
          className="order-1"
          customerName={customerName}
          domain={domain}
          isCustomer={isCustomer}
        />

        <div className="order-3 flex items-center gap-2.5 md:order-2">
          <PeriodSegmented className="w-full md:w-auto" />
          <ExportReportMenu customerId={customerId} className="hidden md:inline-flex" />
        </div>

        <TabsList
          aria-label="ส่วนของรายงาน"
          className={cn(
            'border-glass-border order-2 flex h-auto w-full gap-0.5 rounded-[15px] bg-white/60 p-1 backdrop-blur-md md:order-3 md:col-span-2 dark:bg-white/5',
            isCustomer && 'md:hidden',
          )}
        >
          {SECTIONS.map(({ value, short, full, icon: Icon }) => (
            <TabsTrigger
              key={value}
              value={value}
              className="data-active:text-primary-foreground h-11 min-w-0 flex-auto rounded-[11px] px-2 text-[13px] data-active:bg-transparent data-active:shadow-none dark:data-active:bg-transparent"
            >
              {activeTab === value && (
                <motion.span
                  layoutId="report-section-pill"
                  aria-hidden
                  className="bg-primary absolute inset-0 rounded-[11px]"
                  transition={{ duration: 0.3, ease: EASE_OUT }}
                />
              )}
              <span className="relative flex min-w-0 items-center gap-1.5">
                <Icon aria-hidden className="hidden size-4 sm:block" />
                <span className="truncate xl:hidden">{short}</span>
                <span className="hidden truncate xl:inline">{full}</span>
              </span>
            </TabsTrigger>
          ))}
        </TabsList>
      </div>

      {SECTIONS.map(({ value }) => (
        <TabsContent key={value} value={value} className="mt-0 min-w-0">
          <FadeSwap>{panels[value]}</FadeSwap>
        </TabsContent>
      ))}

      <ExportReportMenu
        customerId={customerId}
        className="h-[52px] w-full rounded-2xl text-[15px] md:hidden"
      />
    </Tabs>
  )
}

const ReportError = ({ message }: { message: string }) => (
  <Card role="alert">
    <CardContent className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
      <span
        aria-hidden
        className="bg-danger-subtle text-danger-strong flex size-12 shrink-0 items-center justify-center rounded-2xl"
      >
        <CircleAlert className="size-6" />
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <h1 className="text-lg font-semibold">โหลดรายงานไม่สำเร็จ</h1>
        <p className="text-text-secondary text-sm break-words">
          ระบบดึงข้อมูลรายงานไม่ได้ ({message}) — ลองโหลดใหม่อีกครั้ง
          หากยังไม่ได้ให้ติดต่อทีมงานที่ดูแลบัญชีของคุณ
        </p>
      </div>
      <Button onClick={() => window.location.reload()} className="h-11 gap-2 rounded-xl px-4">
        <RefreshCw aria-hidden className="size-4" />
        ลองใหม่
      </Button>
    </CardContent>
  </Card>
)

const ReportPage: React.FC<ReportPageProps> = ({ customerId, initialData }) => {
  const { reportData, isLoading, error } = useReportPage(customerId, initialData)

  if (isLoading) return <ReportSkeleton />
  if (error) return <ReportError message={error} />

  const customerName = reportData?.customerName || 'ลูกค้า'
  const domain = reportData?.domain || null

  return (
    <HistoryProvider customerId={customerId}>
      <ReportFiltersProvider>
        <Suspense fallback={<ReportSkeleton />}>
          <ReportTabs
            reportData={reportData ?? undefined}
            customerId={customerId}
            customerName={customerName}
            domain={domain}
          />
        </Suspense>
      </ReportFiltersProvider>
    </HistoryProvider>
  )
}

export default ReportPage
