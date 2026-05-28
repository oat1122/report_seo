import { DashboardLayout } from '@/components/Layout/DashboardLayout'
import { Skeleton } from '@/components/ui/skeleton'

export default function CustomerLoading() {
  return (
    <DashboardLayout>
      <div className="mx-auto w-full max-w-screen-xl px-4 py-8">
        {/* Hero */}
        <Skeleton className="mb-8 h-56 rounded-2xl" />

        {/* Promotion header */}
        <div className="mb-6 flex flex-col items-center gap-2">
          <Skeleton className="h-9 w-44" />
          <Skeleton className="h-10 w-80" />
          <Skeleton className="h-5 w-64" />
        </div>

        {/* Promotion cards */}
        <div className="mb-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-80 rounded-2xl" />
          ))}
        </div>

        {/* Quick actions header */}
        <div className="mb-5 space-y-1">
          <Skeleton className="h-10 w-44" />
          <Skeleton className="h-5 w-72" />
        </div>

        {/* Quick action cards */}
        <div className="grid gap-4 md:grid-cols-2">
          {[0, 1].map((i) => (
            <Skeleton key={i} className="h-44 rounded-2xl" />
          ))}
        </div>
      </div>
    </DashboardLayout>
  )
}
