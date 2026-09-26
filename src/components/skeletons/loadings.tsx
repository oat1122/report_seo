import type { ReactNode } from 'react'
import { DashboardLayout } from '@/components/Layout/DashboardLayout'
import { DomainDataManagerSkeleton } from '@/features/users/presentation/components/MetricsModal/DomainDataManagerSkeleton'
import {
  PageHeaderSkeleton,
  KpiGridSkeleton,
  ChartCardSkeleton,
  DataTableSkeleton,
  CardGridSkeleton,
  CustomerHubSkeleton,
  FormSkeleton,
  ReportSkeleton,
  Shimmer,
} from '@/components/skeletons'

// Page-level loading shells — ห่อ DashboardLayout + compose building blocks
// route loading.tsx แต่ละ segment re-export ตัวที่ตรง archetype (1 บรรทัด) เพื่อ reuse ไม่ซ้ำโค้ด
// <main> ของ shell มี padding แนวนอนแล้ว → ไม่ต้องห่อ max-w / px อีกชั้น

function Page({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <DashboardLayout>
      <div className={className ?? 'flex flex-col gap-5'}>{children}</div>
    </DashboardLayout>
  )
}

export function CustomerLandingLoading() {
  return (
    <Page>
      <CustomerHubSkeleton />
      <div className="flex flex-col gap-2">
        <Shimmer className="h-6 w-32 rounded-full" />
        <Shimmer className="h-7 w-72 max-w-full" />
      </div>
      <CardGridSkeleton cols={3} count={3} />
    </Page>
  )
}

export function CustomerReportLoading() {
  return (
    <Page>
      <ReportSkeleton />
    </Page>
  )
}

export function WorkProgressListLoading() {
  return (
    <Page>
      <PageHeaderSkeleton />
      <CardGridSkeleton cols={3} count={3} />
    </Page>
  )
}

export function PlanDetailLoading() {
  return (
    <Page>
      <PageHeaderSkeleton />
      <KpiGridSkeleton count={4} />
      <div className="grid gap-4 md:grid-cols-2">
        <ChartCardSkeleton height="h-64" />
        <ChartCardSkeleton height="h-64" />
      </div>
      <DataTableSkeleton rows={6} cols={6} />
    </Page>
  )
}

export function PaymentsLoading() {
  return (
    <Page>
      <PageHeaderSkeleton />
      <div className="flex flex-wrap gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Shimmer key={i} className="h-9 w-28 rounded-[10px]" />
        ))}
      </div>
      <DataTableSkeleton rows={5} cols={5} />
    </Page>
  )
}

export function UsersLoading() {
  return (
    <Page>
      <PageHeaderSkeleton />
      <DataTableSkeleton rows={8} cols={5} />
    </Page>
  )
}

export function AdminHubLoading() {
  return (
    <Page>
      <PageHeaderSkeleton />
      <KpiGridSkeleton count={4} />
      <CardGridSkeleton cols={2} count={4} />
    </Page>
  )
}

export function DocumentsLoading() {
  return (
    <Page>
      <PageHeaderSkeleton />
      <div className="flex flex-wrap gap-2">
        <Shimmer className="h-11 w-64 max-w-full rounded-[12px]" />
        <Shimmer className="h-11 w-40 rounded-[12px]" />
      </div>
      <DataTableSkeleton rows={8} cols={6} />
    </Page>
  )
}

export function CompanySettingsLoading() {
  return (
    <Page>
      <PageHeaderSkeleton />
      <div className="grid gap-6 lg:grid-cols-3">
        <FormSkeleton rows={5} className="lg:col-span-2" />
        <div className="bg-glass-card border-glass-border shadow-card space-y-4 rounded-[20px] border p-6">
          <Shimmer className="h-4 w-24" />
          <Shimmer className="aspect-square w-full rounded-2xl" />
        </div>
      </div>
    </Page>
  )
}

export function WorkProgressSettingsLoading() {
  return (
    <Page>
      <PageHeaderSkeleton />
      <div className="grid gap-6 md:grid-cols-[220px_1fr]">
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Shimmer key={i} className="h-11 w-full rounded-xl" />
          ))}
        </div>
        <CardGridSkeleton cols={2} count={4} />
      </div>
    </Page>
  )
}

export function TemplateListLoading() {
  return (
    <Page>
      <PageHeaderSkeleton />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Shimmer key={i} className="h-32 rounded-[20px]" />
        ))}
      </div>
    </Page>
  )
}

export function TemplateBuilderLoading() {
  return (
    <Page>
      <PageHeaderSkeleton />
      <FormSkeleton rows={3} />
      <DataTableSkeleton rows={6} cols={5} />
    </Page>
  )
}

export function DomainDataLoading() {
  return (
    <DashboardLayout>
      <DomainDataManagerSkeleton />
    </DashboardLayout>
  )
}
