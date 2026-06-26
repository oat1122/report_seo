'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  ListChecks,
  ArrowRight,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  X,
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
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
}

// rail = แถบสีซ้าย, pill = badge ความสำคัญ — map สี design → theme token (rule 08)
const priorityStyle: Record<
  NextStepPriority,
  { label: string; rail: string; pill: string; dot: string }
> = {
  HIGH: {
    label: 'สำคัญมาก',
    rail: 'bg-destructive',
    pill: 'bg-destructive/10 text-destructive',
    dot: 'bg-destructive',
  },
  MEDIUM: {
    label: 'ปานกลาง',
    rail: 'bg-warning',
    pill: 'bg-warning/10 text-warning',
    dot: 'bg-warning',
  },
  LOW: {
    label: 'ทั่วไป',
    rail: 'bg-info',
    pill: 'bg-info/10 text-info',
    dot: 'bg-info',
  },
}

export function NextStepsCard({ customerId, limit, className }: NextStepsCardProps) {
  const { data, isLoading } = useGetNextSteps(customerId)
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})
  const [lightbox, setLightbox] = useState<{ images: string[]; index: number } | null>(null)

  if (isLoading) {
    return <Skeleton className={cn('h-64 w-full rounded-2xl', className)} />
  }

  const steps = data ?? []
  if (steps.length === 0) return null

  const shown = limit ? steps.slice(0, limit) : steps
  const hasHidden = steps.length > shown.length

  const showPrev = () =>
    setLightbox((l) =>
      l ? { ...l, index: (l.index - 1 + l.images.length) % l.images.length } : l,
    )
  const showNext = () =>
    setLightbox((l) => (l ? { ...l, index: (l.index + 1) % l.images.length } : l))

  return (
    <Card className={cn('border-border gap-0 rounded-2xl border py-0 shadow-sm ring-0', className)}>
      <div className="flex items-center gap-3 px-[22px] pt-5 pb-4">
        <span className="bg-info/15 text-info flex size-[38px] shrink-0 items-center justify-center rounded-xl">
          <ListChecks className="size-5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-base leading-tight font-semibold tracking-tight">
            สิ่งที่แนะนำให้ทำต่อ
          </p>
          <p className="text-muted-foreground mt-0.5 text-xs">รายการที่ทีมแนะนำให้ดำเนินการ</p>
        </div>
        <Badge variant="secondary" className="bg-muted text-muted-foreground h-[26px] gap-1.5 px-3 text-sm font-semibold">
          <span className="bg-info size-1.5 rounded-full" />
          {steps.length}
        </Badge>
      </div>

      <div className="bg-border mx-[22px] h-px" />

      <div className="flex flex-col">
        {shown.map((step) => (
          <NextStepRow
            key={step.id}
            step={step}
            expanded={!!expanded[step.id]}
            onToggle={() => setExpanded((e) => ({ ...e, [step.id]: !e[step.id] }))}
            onOpenImage={(index) =>
              setLightbox({ images: step.images.map((img) => img.imageUrl), index })
            }
          />
        ))}
      </div>

      {hasHidden && (
        <Link
          href={FULL_REPORT_HREF}
          className="bg-muted/40 text-muted-foreground hover:text-foreground flex items-center justify-center gap-1.5 border-t px-4 py-3.5 text-sm font-semibold transition-colors"
        >
          ดูทั้งหมดในรายงานเต็ม ({steps.length} รายการ)
          <ArrowRight className="size-4" />
        </Link>
      )}

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
                className="bg-foreground/60 text-background hover:bg-foreground/80 absolute -top-12 right-0 rounded-full"
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
                    className="bg-foreground/60 text-background hover:bg-foreground/80 rounded-full"
                  >
                    <ChevronLeft />
                  </Button>
                  {lightbox.index + 1} / {lightbox.images.length}
                  <Button
                    size="icon"
                    variant="secondary"
                    aria-label="ถัดไป"
                    onClick={showNext}
                    className="bg-foreground/60 text-background hover:bg-foreground/80 rounded-full"
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
    <div className="hover:bg-muted/40 relative px-[22px] py-[18px] pl-[26px] transition-colors">
      <span
        className={cn('absolute top-[18px] bottom-[18px] left-0 w-[3px] rounded-r-[3px]', p.rail)}
        aria-hidden
      />

      <div className="flex items-start gap-3">
        <p className="min-w-0 flex-1 text-[15px] leading-snug font-semibold tracking-tight break-words">
          {step.title}
        </p>
        <Badge className={cn('h-[23px] gap-1.5 border-transparent px-[9px] font-semibold', p.pill)}>
          <span className={cn('size-[5px] rounded-full', p.dot)} />
          {p.label}
        </Badge>
      </div>

      {step.description && (
        <p
          className={cn(
            'text-muted-foreground mt-[7px] text-[13.5px] leading-relaxed break-words whitespace-pre-line',
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
          className="text-muted-foreground hover:text-foreground mt-1.5 inline-flex items-center gap-1 text-xs font-semibold transition-colors"
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
                aria-label="ดูรูปภาพ"
                className="border-border bg-muted relative size-[68px] shrink-0 overflow-hidden rounded-xl border transition-transform hover:-translate-y-0.5 hover:shadow-md"
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
