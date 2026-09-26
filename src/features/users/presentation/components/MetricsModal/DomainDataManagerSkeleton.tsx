import { Skeleton } from '@/components/ui/skeleton'

// Skeleton ของหน้า Domain (admin + seo) — mirror หัว workspace + เมนูหมวด 240px + เนื้อหาภาพรวม
// body เท่านั้น (ไม่รวม DashboardLayout — ให้ loading.tsx ห่อ)
export function DomainDataManagerSkeleton() {
  return (
    <div className="flex flex-col gap-5" aria-busy="true" aria-label="กำลังโหลดข้อมูล Domain">
      {/* หัว workspace: breadcrumb → avatar + ชื่อ → แท็บ */}
      <div className="flex flex-col gap-4">
        <Skeleton className="h-4 w-48" />
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <Skeleton className="size-[52px] rounded-full" />
            <div className="flex flex-col gap-2">
              <Skeleton className="h-7 w-48" />
              <Skeleton className="h-4 w-36" />
            </div>
          </div>
          <Skeleton className="hidden h-11 w-40 rounded-[12px] sm:block" />
        </div>
        <Skeleton className="h-12 w-full max-w-[520px] rounded-[14px]" />
      </div>

      <div className="grid grid-cols-1 gap-[18px] xl:grid-cols-[240px_minmax(0,1fr)] xl:items-start">
        <div className="bg-glass-card border-glass-border grid grid-cols-2 gap-1 rounded-[20px] border p-3.5 sm:grid-cols-3 xl:grid-cols-1">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-11 w-full rounded-xl" />
          ))}
        </div>

        <div className="flex min-w-0 flex-col gap-[18px]">
          <div className="flex flex-col gap-2">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-64" />
          </div>
          <div className="grid grid-cols-2 gap-3.5 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-[104px] w-full rounded-[20px]" />
            ))}
          </div>
          <Skeleton className="h-[82px] w-full rounded-[20px]" />
          <Skeleton className="h-44 w-full rounded-[20px]" />
        </div>
      </div>
    </div>
  )
}
