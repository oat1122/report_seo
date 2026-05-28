import { DashboardLayout } from '@/components/Layout/DashboardLayout'
import { Skeleton } from '@/components/ui/skeleton'

export default function CustomerReportLoading() {
  return (
    <DashboardLayout>
      <div className="mx-auto w-full max-w-screen-xl px-4 py-8">
        {/* Header */}
        <div className="mb-6 space-y-2">
          <Skeleton className="h-12 w-3/5" />
          <Skeleton className="h-7 w-1/3" />
        </div>

        {/* Summary stats — 4 KPI cards */}
        <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-28 rounded-2xl" />
          ))}
        </div>

        {/* Overall metrics + recommendations */}
        <div className="mb-6 grid gap-4 lg:grid-cols-3">
          <Skeleton className="h-96 rounded-2xl lg:col-span-2" />
          <Skeleton className="h-96 rounded-2xl" />
        </div>

        {/* Trend charts */}
        <Skeleton className="mb-6 h-72 rounded-2xl" />
        <Skeleton className="mb-6 h-72 rounded-2xl" />

        {/* Top keywords */}
        <Skeleton className="mb-6 h-80 rounded-2xl" />

        {/* Other keywords + AI overview */}
        <div className="grid gap-4 lg:grid-cols-12">
          <Skeleton className="h-80 rounded-2xl lg:col-span-7" />
          <Skeleton className="h-80 rounded-2xl lg:col-span-5" />
        </div>
      </div>
    </DashboardLayout>
  )
}
