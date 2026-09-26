'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ListChecks, ArrowRight, ChevronDown, ChevronLeft, ChevronRight, X } from 'lucide-react'
import { Card, CardAction, CardContent, CardDescription, CardHeader } from '@/components/ui/card'
import { Shimmer } from '@/components/skeletons'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import type { NextStep, NextStepPriority } from '../../domain/NextStep'
import { useGetNextSteps } from '../hooks/useNextSteps'

// hub glimpse → หน้ารายงานเต็มของลูกค้า (route เดียวกับเมนู "รายงาน" ใน QuickNav)
const FULL_REPORT_HREF = '/customer/report'
const MAX_THUMBS = 3
const LONG_DESC_THRESHOLD = 110

interface NextStepsCardProps {
  customerId: string
  // จำกัดจำนวนที่โชว์ (เช่น glimpse บนหน้า /customer hub) — ไม่ใส่ = โชว์ทั้งหมด
  limit?: number
  className?: string
  /** true = แสดงการ์ดพร้อมข้อความว่างเมื่อยังไม่มีรายการ (ค่าเดิม: ซ่อนการ์ดทั้งใบ) */
  showEmpty?: boolean
}

// rail = แถบสีซ้าย, badge = ป้ายความสำคัญ (Badge สถานะของ UI Kit)
const priorityStyle: Record<
  NextStepPriority,
  { label: string; rail: string; badge: 'danger' | 'warning' | 'info' }
> = {
  HIGH: { label: 'สำคัญมาก', rail: 'bg-destructive', badge: 'danger' },
  MEDIUM: { label: 'ปานกลาง', rail: 'bg-warning-accent', badge: 'warning' },
  LOW: { label: 'ทั่วไป', rail: 'bg-info-strong', badge: 'info' },
}

export function NextStepsCard({
  customerId,
  limit,
  className,
  showEmpty = false,
}: NextStepsCardProps) {
  const { data, isLoading } = useGetNextSteps(customerId)
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})
  const [lightbox, setLightbox] = useState<{ images: string[]; index: number } | null>(null)

  if (isLoading) {
    return <Shimmer className={cn('h-64 w-full rounded-[20px]', className)} />
  }

  const steps = data ?? []
  if (steps.length === 0 && !showEmpty) return null

  const shown = limit ? steps.slice(0, limit) : steps
  const hasHidden = steps.length > shown.length

  const showPrev = () =>
    setLightbox((l) => (l ? { ...l, index: (l.index - 1 + l.images.length) % l.images.length } : l))
  const showNext = () =>
    setLightbox((l) => (l ? { ...l, index: (l.index + 1) % l.images.length } : l))

  return (
    <Card className={cn('min-w-0', className)}>
      <CardHeader>
        <div className="flex min-w-0 items-center gap-3">
          <span
            aria-hidden
            className="bg-info-subtle text-info-strong flex size-10 shrink-0 items-center justify-center rounded-xl"
          >
            <ListChecks className="size-5" />
          </span>
          <div className="flex min-w-0 flex-col gap-1">
            <h2 className="text-[17px] leading-snug font-semibold">สิ่งที่แนะนำให้ทำต่อ</h2>
            <CardDescription>รายการที่ทีมแนะนำให้ดำเนินการ</CardDescription>
          </div>
        </div>
        {steps.length > 0 && (
          <CardAction>
            <Badge variant="neutral" className="h-7 px-3 text-sm font-semibold tabular-nums">
              <span data-dot aria-hidden className="bg-info-strong" />
              {steps.length}
              <span className="sr-only">รายการ</span>
            </Badge>
          </CardAction>
        )}
      </CardHeader>

      <CardContent className="flex flex-1 flex-col gap-1.5 px-3 md:px-4">
        {steps.length === 0 ? (
          <p className="bg-glass-tile text-text-secondary rounded-[14px] px-4 py-8 text-center text-sm">
            ยังไม่มีรายการแนะนำในตอนนี้ — ทีมจะเพิ่มคำแนะนำหลังตรวจเว็บรอบถัดไป
          </p>
        ) : (
          shown.map((step) => (
            <NextStepRow
              key={step.id}
              step={step}
              expanded={!!expanded[step.id]}
              onToggle={() => setExpanded((e) => ({ ...e, [step.id]: !e[step.id] }))}
              onOpenImage={(index) =>
                setLightbox({ images: step.images.map((img) => img.imageUrl), index })
              }
            />
          ))
        )}

        {hasHidden && (
          <Button asChild variant="soft" className="mt-2 w-full">
            <Link href={FULL_REPORT_HREF}>
              ดูทั้งหมดในรายงานเต็ม ({steps.length} รายการ)
              <ArrowRight aria-hidden />
            </Link>
          </Button>
        )}
      </CardContent>

      <Dialog open={!!lightbox} onOpenChange={(o) => !o && setLightbox(null)}>
        <DialogContent
          className="max-h-[95vh] max-w-[95vw] border-none bg-transparent p-0 shadow-none"
          showCloseButton={false}
        >
          <DialogTitle className="sr-only">ภาพขยาย</DialogTitle>
          {lightbox && (
            <div className="relative flex flex-col items-center gap-3.5">
              <Button
                size="icon"
                variant="secondary"
                aria-label="ปิด"
                onClick={() => setLightbox(null)}
                className="bg-foreground/60 text-background hover:bg-foreground/80 absolute -top-12 right-0 size-11 rounded-full"
              >
                <X />
              </Button>

              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={lightbox.images[lightbox.index]}
                alt="รูปภาพประกอบ"
                className="max-h-[78vh] max-w-[88vw] rounded-2xl object-contain"
              />

              {lightbox.images.length > 1 && (
                <div className="text-background flex items-center gap-3.5 text-sm font-medium">
                  <Button
                    size="icon"
                    variant="secondary"
                    aria-label="ก่อนหน้า"
                    onClick={showPrev}
                    className="bg-foreground/60 text-background hover:bg-foreground/80 size-11 rounded-full"
                  >
                    <ChevronLeft />
                  </Button>
                  {lightbox.index + 1} / {lightbox.images.length}
                  <Button
                    size="icon"
                    variant="secondary"
                    aria-label="ถัดไป"
                    onClick={showNext}
                    className="bg-foreground/60 text-background hover:bg-foreground/80 size-11 rounded-full"
                  >
                    <ChevronRight />
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  )
}

interface NextStepRowProps {
  step: NextStep
  expanded: boolean
  onToggle: () => void
  onOpenImage: (index: number) => void
}

function NextStepRow({ step, expanded, onToggle, onOpenImage }: NextStepRowProps) {
  const p = priorityStyle[step.priority]
  const isLongDesc = (step.description?.length ?? 0) > LONG_DESC_THRESHOLD
  const images = step.images.map((img) => img.imageUrl)
  const tiles = images.slice(0, MAX_THUMBS)
  const extraCount = images.length - MAX_THUMBS + 1

  return (
    <div className="hover:bg-glass-tile relative rounded-[14px] py-3.5 pr-3 pl-5 transition-colors">
      <span
        className={cn('absolute top-3.5 bottom-3.5 left-1.5 w-[3px] rounded-full', p.rail)}
        aria-hidden
      />

      <div className="flex items-start gap-3">
        <p className="min-w-0 flex-1 text-[15px] leading-snug font-semibold break-words">
          {step.title}
        </p>
        <Badge variant={p.badge} className="font-semibold">
          <span data-dot aria-hidden />
          {p.label}
        </Badge>
      </div>

      {step.description && (
        <p
          className={cn(
            'text-text-secondary mt-1.5 text-sm leading-relaxed break-words whitespace-pre-line',
            isLongDesc && !expanded && 'line-clamp-2',
          )}
        >
          {step.description}
        </p>
      )}

      {isLongDesc && (
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={expanded}
          className="text-text-secondary hover:text-foreground focus-visible:ring-ring/60 -ml-1 inline-flex min-h-11 items-center gap-1 rounded-lg px-1 text-xs font-semibold outline-none focus-visible:ring-3 md:min-h-8"
        >
          {expanded ? 'ย่อ' : 'ดูเพิ่มเติม'}
          <ChevronDown
            className={cn('size-3.5 transition-transform', expanded && 'rotate-180')}
            aria-hidden
          />
        </button>
      )}

      {images.length > 0 && (
        <div className="mt-3 flex gap-2">
          {tiles.map((url, idx) => {
            const isOverlayTile = idx === MAX_THUMBS - 1 && images.length > MAX_THUMBS
            return (
              <button
                type="button"
                key={url}
                onClick={() => onOpenImage(idx)}
                aria-label={`ดูรูปภาพที่ ${idx + 1}`}
                className="border-glass-border bg-muted focus-visible:ring-ring/60 relative size-[68px] shrink-0 overflow-hidden rounded-xl border outline-none focus-visible:ring-3"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt={step.title} className="size-full object-cover" />
                {isOverlayTile && (
                  <span className="bg-foreground/60 text-background absolute inset-0 flex items-center justify-center text-[15px] font-semibold">
                    +{extraCount}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
