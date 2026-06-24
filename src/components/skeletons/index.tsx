import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

// Building blocks สำหรับ loading state — compose ใน loading.tsx / isLoading branch
// โครงภายในสื่อ layout จริง (ไม่ใช่กล่องเทาเปล่า) ใช้ theme token (bg-card/border-border/bg-muted)

export function PageHeaderSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('space-y-2', className)}>
      <Skeleton className="h-9 w-1/2" />
      <Skeleton className="h-5 w-1/3" />
    </div>
  )
}

export function KpiCardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('border-border bg-card space-y-3 rounded-2xl border p-5', className)}>
      <div className="flex items-center gap-2">
        <Skeleton className="size-2 rounded-full" />
        <Skeleton className="h-4 w-24" />
      </div>
      <Skeleton className="h-8 w-20" />
      <Skeleton className="h-3 w-28" />
    </div>
  )
}

export function KpiGridSkeleton({
  count = 4,
  className,
}: {
  count?: number
  className?: string
}) {
  return (
    <div className={cn('grid grid-cols-2 gap-3 md:grid-cols-4', className)}>
      {Array.from({ length: count }).map((_, i) => (
        <KpiCardSkeleton key={i} />
      ))}
    </div>
  )
}

export function ChartCardSkeleton({
  height = 'h-72',
  className,
}: {
  height?: string
  className?: string
}) {
  return (
    <div className={cn('border-border bg-card space-y-4 rounded-2xl border p-5', className)}>
      <div className="space-y-2">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-3 w-56" />
      </div>
      <Skeleton className={cn('w-full rounded-xl', height)} />
      <div className="flex gap-3">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-3 w-16" />
      </div>
    </div>
  )
}

export function DataTableSkeleton({
  rows = 6,
  cols = 4,
  className,
}: {
  rows?: number
  cols?: number
  className?: string
}) {
  return (
    <div className={cn('border-border bg-card overflow-hidden rounded-2xl border', className)}>
      <div className="border-border flex gap-4 border-b p-4">
        {Array.from({ length: cols }).map((_, i) => (
          <Skeleton key={i} className="h-4 flex-1" />
        ))}
      </div>
      <div className="divide-border divide-y">
        {Array.from({ length: rows }).map((_, r) => (
          <div key={r} className="flex gap-4 p-4">
            {Array.from({ length: cols }).map((_, c) => (
              <Skeleton key={c} className="h-4 flex-1" />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

export function CardGridSkeleton({
  count = 4,
  cols = 2,
  className,
}: {
  count?: number
  cols?: 2 | 3
  className?: string
}) {
  const gridCols = cols === 3 ? 'md:grid-cols-2 xl:grid-cols-3' : 'md:grid-cols-2'
  return (
    <div className={cn('grid gap-4', gridCols, className)}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="border-border bg-card space-y-3 rounded-2xl border p-5">
          <div className="flex items-center gap-2">
            <Skeleton className="size-5 rounded-md" />
            <Skeleton className="h-5 w-2/3" />
          </div>
          <Skeleton className="h-4 w-full" />
          <div className="flex gap-2">
            <Skeleton className="h-5 w-16 rounded-full" />
            <Skeleton className="h-5 w-12 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  )
}

export function HeroCardSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'border-border bg-card flex flex-col items-center justify-center gap-3 rounded-2xl border p-8',
        className,
      )}
    >
      <Skeleton className="size-12 rounded-xl" />
      <Skeleton className="h-7 w-64" />
      <Skeleton className="h-4 w-80" />
    </div>
  )
}

export function FormSkeleton({
  rows = 5,
  className,
}: {
  rows?: number
  className?: string
}) {
  return (
    <div className={cn('border-border bg-card space-y-5 rounded-2xl border p-6', className)}>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-10 w-full rounded-md" />
        </div>
      ))}
      <Skeleton className="h-10 w-32 rounded-md" />
    </div>
  )
}

// Report-shaped skeleton — ใช้ทั้ง route loading.tsx (navigate) และ ReportPage (React Query โหลด)
export function ReportSkeleton() {
  return (
    <>
      <PageHeaderSkeleton className="mb-6" />
      <KpiGridSkeleton count={4} className="mb-6" />
      <div className="mb-6 grid gap-4 lg:grid-cols-3">
        <ChartCardSkeleton height="h-80" className="lg:col-span-2" />
        <ChartCardSkeleton height="h-80" />
      </div>
      <ChartCardSkeleton height="h-64" className="mb-6" />
      <ChartCardSkeleton height="h-64" className="mb-6" />
      <DataTableSkeleton rows={6} cols={5} />
    </>
  )
}
