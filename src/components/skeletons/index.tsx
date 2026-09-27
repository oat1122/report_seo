import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

// Building blocks สำหรับ loading state — compose ใน loading.tsx / isLoading branch
// โครงภายในสื่อ layout จริง (ไม่ใช่กล่องเทาเปล่า) · การ์ดเป็น glass เหมือนหน้าจริง
// แท่ง = ui/Skeleton (shimmer ม่วงอ่อน 1.4s, หยุดเมื่อ prefers-reduced-motion)

const GLASS_CARD =
  'bg-glass-card border-glass-border shadow-card rounded-[20px] border backdrop-blur-[14px]'

/** แท่ง skeleton (ซ่อนจาก screen reader — ตัว container บอกสถานะแทน) */
export function Shimmer({ className }: { className?: string }) {
  return <Skeleton aria-hidden className={className} />
}

export function PageHeaderSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('space-y-2', className)}>
      <Shimmer className="h-9 w-1/2" />
      <Shimmer className="h-5 w-1/3" />
    </div>
  )
}

export function KpiCardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn(GLASS_CARD, 'flex flex-col gap-3 p-4 md:p-5', className)}>
      <div className="flex items-center justify-between gap-2">
        <Shimmer className="h-4 w-24" />
        <Shimmer className="hidden h-3 w-14 md:block" />
      </div>
      <div className="flex items-end justify-between gap-3">
        <div className="flex flex-col gap-2">
          <Shimmer className="h-8 w-20" />
          <Shimmer className="h-5 w-16 rounded-full" />
        </div>
        <Shimmer className="h-10 w-16 rounded-xl md:w-24" />
      </div>
    </div>
  )
}

export function KpiGridSkeleton({ count = 4, className }: { count?: number; className?: string }) {
  return (
    <div className={cn('grid grid-cols-2 gap-3 md:gap-[18px] xl:grid-cols-4', className)}>
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
    <div className={cn(GLASS_CARD, 'space-y-4 p-5 md:p-6', className)}>
      <div className="space-y-2">
        <Shimmer className="h-5 w-40" />
        <Shimmer className="h-3 w-56 max-w-full" />
      </div>
      <Shimmer className={cn('w-full rounded-2xl', height)} />
      <div className="flex gap-3">
        <Shimmer className="h-3 w-16" />
        <Shimmer className="h-3 w-16" />
        <Shimmer className="h-3 w-16" />
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
    <div className={cn(GLASS_CARD, 'overflow-hidden', className)}>
      <div className="border-border flex gap-4 border-b p-4">
        {Array.from({ length: cols }).map((_, i) => (
          <Shimmer key={i} className="h-4 flex-1" />
        ))}
      </div>
      <div className="divide-border divide-y">
        {Array.from({ length: rows }).map((_, r) => (
          <div key={r} className="flex gap-4 p-4">
            {Array.from({ length: cols }).map((_, c) => (
              <Shimmer key={c} className="h-4 flex-1" />
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
        <div key={i} className={cn(GLASS_CARD, 'space-y-3 p-5')}>
          <div className="flex items-center gap-2">
            <Shimmer className="size-5 rounded-md" />
            <Shimmer className="h-5 w-2/3" />
          </div>
          <Shimmer className="h-4 w-full" />
          <div className="flex gap-2">
            <Shimmer className="h-5 w-16 rounded-full" />
            <Shimmer className="h-5 w-12 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  )
}

export function FormSkeleton({ rows = 5, className }: { rows?: number; className?: string }) {
  return (
    <div className={cn(GLASS_CARD, 'space-y-5 p-6', className)}>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="space-y-2">
          <Shimmer className="h-4 w-32" />
          <Shimmer className="h-11 w-full rounded-[12px]" />
        </div>
      ))}
      <Shimmer className="h-11 w-32 rounded-[12px]" />
    </div>
  )
}

/** หัวหน้ารายงาน/hub: avatar + ชื่อ + โดเมน | segmented + ปุ่ม */
export function ReportHeaderSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'flex flex-col gap-4 md:flex-row md:items-center md:justify-between',
        className,
      )}
    >
      <div className="flex items-center gap-3.5">
        <Shimmer className="hidden size-[50px] rounded-full sm:block" />
        <div className="flex flex-col gap-2">
          <Shimmer className="h-3.5 w-28" />
          <Shimmer className="h-7 w-56 max-w-full" />
        </div>
      </div>
      <div className="flex items-center gap-2.5">
        <Shimmer className="h-11 w-full rounded-[14px] md:w-56" />
        <Shimmer className="hidden h-[46px] w-36 rounded-[14px] md:block" />
      </div>
    </div>
  )
}

// Report-shaped skeleton — ใช้ทั้ง route loading.tsx (navigate) และ ReportPage (React Query โหลด)
export function ReportSkeleton() {
  return (
    <div role="status" aria-label="กำลังโหลดรายงาน" className="flex flex-col gap-4 md:gap-5">
      <ReportHeaderSkeleton />
      <KpiGridSkeleton count={4} />
      <div className="grid gap-4 md:gap-[18px] xl:grid-cols-3">
        <ChartCardSkeleton height="h-60" className="xl:col-span-2" />
        <ChartCardSkeleton height="h-60" />
      </div>
      <div className="grid gap-4 md:gap-[18px] xl:grid-cols-3">
        <ChartCardSkeleton height="h-32" className="xl:col-span-2" />
        <ChartCardSkeleton height="h-32" />
      </div>
    </div>
  )
}

// Customer hub skeleton — hero, KPI 4 ใบ, 2 คอลัมน์ (สรุปผล/งาน | แจ้งเตือน/ทางลัด)
export function CustomerHubSkeleton() {
  return (
    <div role="status" aria-label="กำลังโหลดหน้าหลัก" className="flex flex-col gap-4 md:gap-5">
      <ReportHeaderSkeleton />
      <KpiGridSkeleton count={4} />
      <div className="grid gap-[18px] lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <div className="flex flex-col gap-[18px]">
          <ChartCardSkeleton height="h-36" />
          <ChartCardSkeleton height="h-44" />
        </div>
        <div className="flex flex-col gap-[18px]">
          <ChartCardSkeleton height="h-56" />
          <CardGridSkeleton count={1} cols={2} className="md:grid-cols-1" />
        </div>
      </div>
    </div>
  )
}
