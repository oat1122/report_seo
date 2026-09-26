'use client'

import Link from 'next/link'
import {
  Archive,
  ArchiveRestore,
  Check,
  ChevronDown,
  ChevronLeft,
  ClipboardList,
  RefreshCw,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import { ProgressSummaryCards } from '../summary/ProgressSummaryCards'
import { PERIOD_LABEL, formatPlanRange } from './planDisplay'
import { useWorkProgressPlan } from '../../hooks/useWorkProgressPlan'
import { useArchivePlan, useWorkProgressPlans } from '../../hooks/useWorkProgressPlans'

interface PlanHeaderBarProps {
  userId: string
  planId: string
  backHref: string
  readOnly?: boolean
}

// การ์ดหัวแผน: ชื่อ + ชิป + action · แถวสรุปความคืบหน้า · หมายเหตุ
export function PlanHeaderBar({ userId, planId, backHref, readOnly }: PlanHeaderBarProps) {
  const { data, isLoading, isError, refetch, isRefetching } = useWorkProgressPlan(userId, planId)
  const archiveMut = useArchivePlan()
  // ตัวเลือก "เปลี่ยนแผน" สำหรับลูกค้า (ดูอย่างเดียว) — staff ใช้ลิงก์ "แผนทั้งหมด"
  const { data: plans } = useWorkProgressPlans(userId, { enabled: !!readOnly })

  const backLink = (
    <Link
      href={backHref}
      className="text-text-secondary hover:text-foreground focus-visible:ring-ring/70 inline-flex min-h-11 items-center gap-1 self-start rounded-[10px] pr-2 text-[13px] outline-none focus-visible:ring-[3px]"
    >
      <ChevronLeft aria-hidden className="size-4" />
      แผนทั้งหมด
    </Link>
  )

  if (isLoading) {
    return (
      <div className="flex flex-col gap-2">
        {backLink}
        <Card className="gap-5 px-4 sm:px-6" aria-busy="true" aria-label="กำลังโหลดแผนงาน">
          <div className="flex items-center gap-3.5">
            <Skeleton className="size-12 rounded-[14px]" />
            <div className="flex flex-col gap-2">
              <Skeleton className="h-6 w-56" />
              <Skeleton className="h-5 w-40" />
            </div>
          </div>
          <Skeleton className="h-[92px] w-full rounded-[16px]" />
        </Card>
      </div>
    )
  }

  if (isError || !data) {
    return (
      <div className="flex flex-col gap-2">
        {backLink}
        <Card className="items-center gap-3 px-6 py-10 text-center" role="alert">
          <p className="text-sm font-medium">
            {isError ? 'โหลดแผนงานไม่สำเร็จ' : 'ไม่พบแผนงานนี้'}
          </p>
          <p className="text-text-secondary text-[13px]">
            {isError
              ? 'ตรวจสอบการเชื่อมต่ออินเทอร์เน็ต แล้วลองโหลดใหม่อีกครั้ง'
              : 'แผนอาจถูกลบไปแล้ว — กลับไปเลือกแผนจากรายการ'}
          </p>
          {isError && (
            <Button variant="outline" onClick={() => refetch()} disabled={isRefetching}>
              <RefreshCw className={cn('size-4', isRefetching && 'animate-spin')} />
              ลองใหม่
            </Button>
          )}
        </Card>
      </div>
    )
  }

  const range = formatPlanRange(data)
  const switchable = (plans ?? []).filter((p) => !p.isArchived)
  const headingId = `plan-title-${planId}`

  return (
    <div className="flex flex-col gap-2">
      {backLink}
      <Card className="gap-5 px-4 py-5 sm:px-6" role="region" aria-labelledby={headingId}>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex min-w-0 items-center gap-3.5">
            <span
              aria-hidden
              className="bg-info-subtle text-info-strong flex size-12 shrink-0 items-center justify-center rounded-[14px]"
            >
              <ClipboardList className="size-6" />
            </span>
            <div className="flex min-w-0 flex-col gap-1.5">
              <h2 id={headingId} className="text-[22px] leading-tight font-semibold">
                {data.title}
              </h2>
              <div className="flex flex-wrap items-center gap-1.5">
                <Badge variant="info">{PERIOD_LABEL[data.periodType] ?? data.periodType}</Badge>
                {range && <Badge variant="outline">{range}</Badge>}
                {data.packageName && (
                  <Badge variant="outline" className="text-text-secondary">
                    {data.packageName}
                  </Badge>
                )}
                {data.isArchived && (
                  <Badge variant="neutral">
                    <Archive />
                    เก็บถาวร
                  </Badge>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 sm:shrink-0">
            {readOnly && switchable.length > 1 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">
                    เปลี่ยนแผน ({switchable.length} แผน)
                    <ChevronDown className="size-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64">
                  {switchable.map((p) => (
                    <DropdownMenuItem key={p.id} asChild>
                      <Link
                        href={`${backHref}/${p.id}`}
                        aria-current={p.id === planId ? 'page' : undefined}
                      >
                        <Check
                          aria-hidden
                          className={cn('size-4', p.id === planId ? 'opacity-100' : 'opacity-0')}
                        />
                        <span className="truncate">{p.title}</span>
                      </Link>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            {!readOnly && (
              <Button
                variant="outline"
                disabled={archiveMut.isPending}
                onClick={() =>
                  archiveMut.mutate({
                    userId,
                    planId,
                    isArchived: !data.isArchived,
                  })
                }
              >
                {data.isArchived ? (
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
              </Button>
            )}
          </div>
        </div>

        <ProgressSummaryCards userId={userId} planId={planId} />

        {data.note && (
          <p className="text-text-secondary max-w-[75ch] text-[13px] leading-relaxed whitespace-pre-line">
            {data.note}
          </p>
        )}
      </Card>
    </div>
  )
}
