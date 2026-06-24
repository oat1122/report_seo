import type { ReactNode } from 'react'
import { DashboardLayout } from '@/components/Layout/DashboardLayout'
import { Skeleton } from '@/components/ui/skeleton'
import { DomainDataManagerSkeleton } from '@/features/users/presentation/components/MetricsModal/DomainDataManagerSkeleton'
import {
  PageHeaderSkeleton,
  KpiGridSkeleton,
  ChartCardSkeleton,
  DataTableSkeleton,
  CardGridSkeleton,
  HeroCardSkeleton,
  FormSkeleton,
  ReportSkeleton,
} from '@/components/skeletons'

// Page-level loading shells — ห่อ DashboardLayout + compose building blocks
// route loading.tsx แต่ละ segment re-export ตัวที่ตรง archetype (1 บรรทัด) เพื่อ reuse ไม่ซ้ำโค้ด

function Page({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <DashboardLayout>
      <div className={className ?? 'mx-auto w-full max-w-screen-xl px-4 py-8'}>{children}</div>
    </DashboardLayout>
  )
}

export function CustomerLandingLoading() {
  return (
    <Page>
      <HeroCardSkeleton className="mb-8 h-56" />
      <div className="mb-6 flex flex-col items-center gap-2">
        <Skeleton className="h-9 w-44" />
        <Skeleton className="h-10 w-80" />
        <Skeleton className="h-5 w-64" />
      </div>
      <CardGridSkeleton cols={3} count={3} className="mb-12" />
      <PageHeaderSkeleton className="mb-5" />
      <div className="grid gap-4 md:grid-cols-2">
        <Skeleton className="h-44 rounded-2xl" />
        <Skeleton className="h-44 rounded-2xl" />
      </div>
    </Page>
  )
}

export function CustomerReportLoading() {
  return (
    <Page className="mx-auto w-full max-w-screen-xl px-4 py-4 md:px-6 md:py-8">
      <ReportSkeleton />
    </Page>
  )
}

export function WorkProgressListLoading() {
  return (
    <Page>
      <PageHeaderSkeleton className="mb-6" />
      <CardGridSkeleton cols={3} count={3} />
    </Page>
  )
}

export function PlanDetailLoading() {
  return (
    <Page>
      <PageHeaderSkeleton className="mb-6" />
      <KpiGridSkeleton count={4} className="mb-6" />
      <div className="mb-6 grid gap-4 md:grid-cols-2">
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
      <PageHeaderSkeleton className="mb-6" />
      <div className="mb-6 flex flex-wrap gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-9 w-28 rounded-md" />
        ))}
      </div>
      <DataTableSkeleton rows={5} cols={5} />
    </Page>
  )
}

export function UsersLoading() {
  return (
    <Page className="mx-auto w-full max-w-6xl py-8">
      <PageHeaderSkeleton className="mb-6" />
      <DataTableSkeleton rows={8} cols={5} />
    </Page>
  )
}

export function AdminHubLoading() {
  return (
    <Page className="space-y-6 p-4 md:p-6">
      <PageHeaderSkeleton />
      <KpiGridSkeleton count={4} />
      <CardGridSkeleton cols={2} count={4} />
    </Page>
  )
}

export function DocumentsLoading() {
  return (
    <Page>
      <PageHeaderSkeleton className="mb-6" />
      <div className="mb-4 flex flex-wrap gap-2">
        <Skeleton className="h-10 w-64 rounded-md" />
        <Skeleton className="h-10 w-40 rounded-md" />
      </div>
      <DataTableSkeleton rows={8} cols={6} />
    </Page>
  )
}

export function CompanySettingsLoading() {
  return (
    <Page>
      <PageHeaderSkeleton className="mb-6" />
      <div className="grid gap-6 lg:grid-cols-3">
        <FormSkeleton rows={5} className="lg:col-span-2" />
        <div className="border-border bg-card space-y-4 rounded-2xl border p-6">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="aspect-square w-full rounded-xl" />
        </div>
      </div>
    </Page>
  )
}

export function WorkProgressSettingsLoading() {
  return (
    <Page>
      <PageHeaderSkeleton className="mb-6" />
      <div className="grid gap-6 md:grid-cols-[220px_1fr]">
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full rounded-xl" />
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
      <PageHeaderSkeleton className="mb-6" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-32 rounded-2xl" />
        ))}
      </div>
    </Page>
  )
}

export function TemplateBuilderLoading() {
  return (
    <Page>
      <PageHeaderSkeleton className="mb-6" />
      <FormSkeleton rows={3} className="mb-6" />
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
