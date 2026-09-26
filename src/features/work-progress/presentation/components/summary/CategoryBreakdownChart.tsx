'use client'

import { useMemo } from 'react'
import { GrowBar } from '@/components/motion'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { useWorkProgressPlan } from '../../hooks/useWorkProgressPlan'
import { isItemCompleted } from '@/features/work-progress/domain/policies/progress-calculator'

interface CategoryBreakdownChartProps {
  userId: string
  planId: string
}

// ความคืบหน้าตามหมวด: item ที่เสร็จ / ทั้งหมด ต่อหมวด · เขียว = ครบ, ม่วง = ยังเหลืองาน
export default function CategoryBreakdownChart({ userId, planId }: CategoryBreakdownChartProps) {
  const { data, isLoading } = useWorkProgressPlan(userId, planId)

  const rows = useMemo(() => {
    if (!data) return []
    const buckets = new Map<
      string,
      {
        id: string
        name: string
        color: string | null
        order: number
        total: number
        done: number
      }
    >()
    for (const item of data.items) {
      const done = isItemCompleted(item) ? 1 : 0
      const cur = buckets.get(item.categoryId)
      if (cur) {
        cur.total += 1
        cur.done += done
      } else
        buckets.set(item.categoryId, {
          id: item.categoryId,
          name: item.category.name,
          color: item.category.color,
          order: item.category.orderIndex,
          total: 1,
          done,
        })
    }
    return Array.from(buckets.values()).sort((a, b) => a.order - b.order)
  }, [data])

  if (isLoading) return <Skeleton className="h-[320px] w-full rounded-[20px]" />
  if (!data) return null

  const fullCount = rows.filter((r) => r.done === r.total).length

  return (
    <Card className="gap-4 px-5 py-5 sm:px-6" role="region" aria-labelledby={`wp-cat-${planId}`}>
      <div className="flex flex-col gap-1">
        <h2 id={`wp-cat-${planId}`} className="text-[17px] font-semibold">
          ความคืบหน้าตามหมวด
        </h2>
        <p className="text-text-secondary text-[13px]">
          {rows.length === 0
            ? 'ยังไม่มี item ในแผนนี้'
            : `ครบทุก item แล้ว ${fullCount} จาก ${rows.length} หมวด · ตัวเลข = item ที่เสร็จ / ทั้งหมด`}
        </p>
      </div>

      {rows.length === 0 ? (
        <p className="text-text-secondary border-border rounded-[16px] border border-dashed px-4 py-10 text-center text-sm">
          เมื่อเพิ่ม item แล้ว ความคืบหน้าของแต่ละหมวดจะแสดงที่นี่
        </p>
      ) : (
        <>
          <ul className="flex flex-col gap-3.5 sm:gap-3">
            {rows.map((r, i) => {
              const full = r.done === r.total
              return (
                <li
                  key={r.id}
                  className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3.5 gap-y-1.5 text-[13px] sm:grid-cols-[minmax(0,200px)_minmax(0,1fr)_64px]"
                >
                  <span className="flex min-w-0 items-center gap-2">
                    <span
                      aria-hidden
                      className="bg-muted-foreground size-2 shrink-0 rounded-[3px]"
                      style={r.color ? { backgroundColor: r.color } : undefined}
                    />
                    <span className="truncate" title={r.name}>
                      {r.name}
                    </span>
                  </span>
                  <span className="text-text-secondary text-right tabular-nums sm:order-last">
                    <strong className="text-foreground font-semibold">{r.done}</strong> / {r.total}
                    <span className="sr-only"> item เสร็จแล้ว</span>
                  </span>
                  <div
                    aria-hidden
                    className="bg-info-subtle col-span-2 h-2.5 overflow-hidden rounded-full sm:col-span-1"
                  >
                    <GrowBar
                      value={r.total === 0 ? 0 : (r.done / r.total) * 100}
                      delay={i * 0.04}
                      className={cn(
                        'h-full rounded-full',
                        full ? 'bg-secondary' : 'bg-info-strong',
                      )}
                    />
                  </div>
                </li>
              )
            })}
          </ul>
          <div aria-hidden className="text-text-secondary flex flex-wrap gap-4 text-xs">
            <span className="inline-flex items-center gap-1.5">
              <span className="bg-secondary h-1.5 w-4 rounded-full" />
              ครบทุก item
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="bg-info-strong h-1.5 w-4 rounded-full" />
              ยังเหลืองาน
            </span>
          </div>
        </>
      )}
    </Card>
  )
}
