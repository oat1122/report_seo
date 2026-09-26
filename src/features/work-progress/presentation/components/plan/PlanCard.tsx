'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import {
  Archive,
  ArchiveRestore,
  ChevronRight,
  ClipboardList,
  MoreHorizontal,
  Pencil,
  Trash2,
} from 'lucide-react'
import { AnimatedNumber, GrowBar, motion } from '@/components/motion'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import { PERIOD_LABEL, formatPlanRange } from './planDisplay'
import { useWorkProgressPlan } from '../../hooks/useWorkProgressPlan'
import {
  calcPlanOverallPercent,
  isItemCompleted,
} from '@/features/work-progress/domain/policies/progress-calculator'
import type { WorkProgressPlan } from '@/features/work-progress'

interface PlanCardProps {
  userId: string
  plan: WorkProgressPlan
  href: string
  onEdit: () => void
  onArchiveToggle: () => void
  onDelete: () => void
  readOnly?: boolean
}

// การ์ดแผน: ทั้งใบคลิกไปหน้าแผน (stretched link) · เมนูจัดการอยู่เหนือ link
export function PlanCard({
  userId,
  plan,
  href,
  onEdit,
  onArchiveToggle,
  onDelete,
  readOnly,
}: PlanCardProps) {
  // ช่วงเดือนแสดงที่ท้ายการ์ด (ปีแสดงเป็นชิปอยู่แล้ว)
  const range = plan.startDate && plan.endDate ? formatPlanRange(plan) : null
  return (
    <motion.div whileHover={{ y: -2 }} transition={{ duration: 0.2 }} className="h-full">
      <Card
        className={cn(
          'relative h-full gap-3.5 px-5 py-5 transition-opacity',
          plan.isArchived && 'opacity-70 focus-within:opacity-100 hover:opacity-100',
        )}
      >
        <div className="flex items-start justify-between gap-2.5">
          <div className="flex min-w-0 items-center gap-3">
            <span
              aria-hidden
              className="bg-info-subtle text-info-strong flex size-[42px] shrink-0 items-center justify-center rounded-[13px]"
            >
              <ClipboardList className="size-5" />
            </span>
            <div className="flex min-w-0 flex-col gap-0.5">
              <h3 className="text-base leading-snug font-semibold">
                <Link
                  href={href}
                  className="focus-visible:after:ring-ring/70 line-clamp-2 outline-none after:absolute after:inset-0 after:rounded-[20px] focus-visible:after:ring-[3px]"
                >
                  {plan.title}
                </Link>
              </h3>
              {plan.packageName && (
                <span className="text-text-secondary truncate text-xs">{plan.packageName}</span>
              )}
            </div>
          </div>
          {readOnly ? (
            <ChevronRight aria-hidden className="text-text-secondary mt-2.5 size-5 shrink-0" />
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  size="icon-sm"
                  variant="ghost"
                  className="relative z-10 shrink-0"
                  aria-label={`เมนูของแผน ${plan.title}`}
                >
                  <MoreHorizontal className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={onEdit}>
                  <Pencil className="size-4" />
                  แก้ไข
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onArchiveToggle}>
                  {plan.isArchived ? (
                    <>
                      <ArchiveRestore className="size-4" />
                      คืนจากที่เก็บ
                    </>
                  ) : (
                    <>
                      <Archive className="size-4" />
                      เก็บถาวร
                    </>
                  )}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onDelete} variant="destructive">
                  <Trash2 className="size-4" />
                  ลบ
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <Badge variant="info">{PERIOD_LABEL[plan.periodType] ?? plan.periodType}</Badge>
          {plan.year && <Badge variant="outline">{plan.year}</Badge>}
          {plan.isArchived && (
            <Badge variant="neutral">
              <Archive />
              เก็บถาวร
            </Badge>
          )}
        </div>

        {plan.note && <p className="text-text-secondary line-clamp-2 text-xs">{plan.note}</p>}

        <PlanCardProgress userId={userId} planId={plan.id} range={range} />
      </Card>
    </motion.div>
  )
}

// ความคืบหน้าของแผน — ใช้ query รายละเอียดแผนเดียวกับหน้าแผน (cache ร่วมกันเมื่อกดเข้าไป)
function PlanCardProgress({
  userId,
  planId,
  range,
}: {
  userId: string
  planId: string
  range: string | null
}) {
  const { data, isLoading, isError } = useWorkProgressPlan(userId, planId)

  const stats = useMemo(() => {
    if (!data) return null
    return {
      overall: calcPlanOverallPercent(data.items),
      total: data.items.length,
      completed: data.items.filter(isItemCompleted).length,
    }
  }, [data])

  return (
    <div className="mt-auto flex flex-col gap-3">
      <div className="flex flex-col gap-2">
        <div className="flex items-baseline justify-between gap-2">
          <span className="text-text-secondary text-[13px]">ความคืบหน้ารวม</span>
          {isLoading ? (
            <Skeleton className="h-6 w-12" />
          ) : stats ? (
            <AnimatedNumber
              value={stats.overall}
              format={(n) => `${Math.round(n)}%`}
              className="text-[22px] leading-none font-semibold tabular-nums"
            />
          ) : (
            <span className="text-text-secondary text-[22px] leading-none font-semibold">—</span>
          )}
        </div>
        <div
          role="progressbar"
          aria-label="ความคืบหน้ารวมของแผน"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={stats?.overall}
          className="bg-info-subtle h-2.5 overflow-hidden rounded-full"
        >
          {stats && (
            <GrowBar
              value={stats.overall}
              className={cn(
                'h-full rounded-full',
                stats.overall >= 100 ? 'bg-secondary' : 'bg-info-strong',
              )}
            />
          )}
        </div>
      </div>
      <div className="border-border text-text-secondary flex flex-wrap justify-between gap-x-3 gap-y-1 border-t pt-2.5 text-xs">
        <span className="tabular-nums">
          {isLoading
            ? 'กำลังโหลด...'
            : isError || !stats
              ? 'โหลดความคืบหน้าไม่สำเร็จ'
              : `${stats.total.toLocaleString('th-TH')} items · เสร็จ ${stats.completed.toLocaleString('th-TH')}`}
        </span>
        {range && <span>{range}</span>}
      </div>
    </div>
  )
}
