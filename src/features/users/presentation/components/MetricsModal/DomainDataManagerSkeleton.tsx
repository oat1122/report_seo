import { Skeleton } from '@/components/ui/skeleton'
import { KpiCardSkeleton } from '@/components/skeletons'

// Skeleton ของหน้า Domain (admin + seo) — mirror layout sidebar+main ของ DomainDataManager
// body เท่านั้น (ไม่รวม DashboardLayout — ให้ loading.tsx ห่อ)
export function DomainDataManagerSkeleton() {
  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6">
      <header className="mb-6 space-y-3">
        <Skeleton className="h-4 w-64" />
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <Skeleton className="size-9 rounded-md" />
            <div className="space-y-2">
              <Skeleton className="h-8 w-56" />
              <Skeleton className="h-4 w-40" />
            </div>
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-10 w-36 rounded-md" />
            <Skeleton className="h-10 w-24 rounded-md" />
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[240px_1fr] lg:items-start">
        <aside className="border-border bg-card space-y-2 rounded-2xl border p-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full rounded-xl" />
          ))}
        </aside>

        <main className="space-y-5">
          <Skeleton className="h-24 w-full rounded-2xl" />
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <KpiCardSkeleton key={i} />
            ))}
          </div>
          <div className="border-border bg-card space-y-4 rounded-2xl border p-6">
            <Skeleton className="h-5 w-40" />
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-20 rounded-xl" />
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
