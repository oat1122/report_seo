'use client'

import { memo, useState } from 'react'
import { Check, X } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import { useMarkTypes } from '../../hooks/useMasterTables'
import { useClearPeriodMark, useSetPeriodMark } from '../../hooks/useSetPeriodMark'
import { onColorTextClass } from './planDisplay'
import type { WorkProgressPeriodMarkWithType } from '@/features/work-progress'

interface PeriodCellProps {
  userId: string
  planId: string
  itemId: string
  periodId: string
  // ชื่อรอบ (เช่น "ก.ย. 2026") — ใช้ใน aria-label และหัว popover
  periodLabel?: string
  mark: WorkProgressPeriodMarkWithType | undefined
  subtaskPercent: number | null
  statusColor: string | null
  // วันที่แนะนำของรอบนี้ (มาจากกฎ recurrence เช่น "ทุกวันที่ 14") — ใช้ prefill ตอนยังไม่มี mark
  defaultScheduledDate?: Date | string | null
  readOnly?: boolean
}

// แปลง Date | string (จาก API) → 'yyyy-mm-dd' สำหรับ <input type="date"> (ใช้เวลาท้องถิ่น)
function toDateInputValue(d: Date | string | null | undefined): string {
  if (d == null) return ''
  const date = typeof d === 'string' ? new Date(d) : d
  if (Number.isNaN(date.getTime())) return ''
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function PeriodCellInner({
  userId,
  planId,
  itemId,
  periodId,
  periodLabel,
  mark,
  subtaskPercent,
  statusColor,
  defaultScheduledDate,
  readOnly,
}: PeriodCellProps) {
  const [open, setOpen] = useState(false)
  const [percent, setPercent] = useState<string>(
    mark?.progressPercent != null ? String(mark.progressPercent) : '',
  )
  const [percentError, setPercentError] = useState('')
  const [note, setNote] = useState(mark?.note ?? '')
  const [scheduledDate, setScheduledDate] = useState<string>(
    toDateInputValue(mark?.scheduledDate ?? defaultScheduledDate),
  )

  const { data: markTypes } = useMarkTypes()
  const setMut = useSetPeriodMark()
  const clearMut = useClearPeriodMark()

  const reset = () => {
    setPercent(mark?.progressPercent != null ? String(mark.progressPercent) : '')
    setPercentError('')
    setNote(mark?.note ?? '')
    setScheduledDate(toDateInputValue(mark?.scheduledDate ?? defaultScheduledDate))
  }

  const scheduledDay = mark?.scheduledDate ? new Date(mark.scheduledDate).getDate() : null

  const handleOpenChange = (next: boolean) => {
    if (next) reset()
    setOpen(next)
  }

  const activeMarkTypes = (markTypes ?? []).filter((m) => m.isActive)
  const defaultMarkType = activeMarkTypes[0] ?? null
  const effectiveMarkType =
    activeMarkTypes.find((m) => m.id === mark?.markTypeId) ?? defaultMarkType

  const handleSave = async () => {
    if (!effectiveMarkType) return
    const p = percent.trim()
    const parsedPercent = p ? Number(p) : null
    if (p && (Number.isNaN(parsedPercent) || parsedPercent! < 0 || parsedPercent! > 100)) {
      setPercentError('กรอกตัวเลข 0–100 หรือเว้นว่างไว้')
      return
    }
    await setMut.mutateAsync({
      userId,
      planId,
      itemId,
      body: {
        periodId,
        markTypeId: effectiveMarkType.id,
        progressPercent: parsedPercent,
        note: note.trim() || null,
        scheduledDate: scheduledDate ? new Date(scheduledDate) : null,
      },
      markType: effectiveMarkType,
    })
    setOpen(false)
  }

  const handleClear = async () => {
    if (!mark) {
      setOpen(false)
      return
    }
    await clearMut.mutateAsync({ userId, planId, itemId, periodId })
    setOpen(false)
  }

  const markColor = mark ? (statusColor ?? mark.markType.color ?? null) : null
  const detail = mark
    ? `${mark.markType.name}${scheduledDay != null ? ` · วันที่ ${scheduledDay}` : ''}${subtaskPercent != null ? ` · ${subtaskPercent}%` : ''}`
    : 'ว่าง'
  const label = periodLabel ? `${periodLabel}: ${detail}` : detail

  // ชิปของช่อง: มี mark = พื้นสีสถานะ + % / วันที่ / เครื่องหมายถูก · ว่าง = กรอบบาง (แก้ได้) หรือจุด (ดูอย่างเดียว)
  const chip = mark ? (
    <span
      aria-hidden
      className={cn(
        'inline-flex h-7 min-w-7 items-center justify-center rounded-[8px] px-0.5 text-[10px] font-semibold tabular-nums',
        markColor ? onColorTextClass(markColor) : 'bg-info-subtle text-foreground',
      )}
      style={markColor ? { backgroundColor: markColor } : undefined}
    >
      {subtaskPercent != null ? (
        `${subtaskPercent}%`
      ) : scheduledDay != null ? (
        scheduledDay
      ) : (
        <Check className="size-3.5" strokeWidth={3} />
      )}
    </span>
  ) : readOnly ? (
    <span aria-hidden className="bg-border size-1.5 rounded-full" />
  ) : (
    <span
      aria-hidden
      className="border-border group-hover/cell:border-info inline-block size-7 rounded-[8px] border transition-colors"
    />
  )

  if (readOnly) {
    return (
      <div className="flex h-full w-full items-center justify-center" title={mark ? detail : ''}>
        {chip}
        <span className="sr-only">{label}</span>
      </div>
    )
  }

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="group/cell hover:bg-info-subtle/60 focus-visible:ring-ring/70 flex h-full min-h-11 w-full cursor-pointer items-center justify-center rounded-[10px] transition-colors outline-none focus-visible:ring-[3px]"
          aria-label={label}
          title={mark ? detail : undefined}
        >
          {chip}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-72 rounded-[16px]" align="start">
        <div className="grid gap-3">
          <div className="flex flex-col gap-0.5">
            <p className="text-sm font-semibold">{periodLabel ?? 'ตั้ง mark'}</p>
            <p className="text-text-secondary text-xs">
              {mark ? `ตอนนี้: ${mark.markType.name}` : 'ยังไม่มี mark ในรอบนี้'}
            </p>
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor={`pc-pct-${itemId}-${periodId}`} className="text-[13px]">
              ความคืบหน้า (%)
            </Label>
            <Input
              id={`pc-pct-${itemId}-${periodId}`}
              type="number"
              inputMode="numeric"
              min={0}
              max={100}
              value={percent}
              onChange={(e) => {
                setPercent(e.target.value)
                setPercentError('')
              }}
              placeholder="0-100"
              aria-invalid={percentError ? true : undefined}
              aria-describedby={percentError ? `pc-pct-err-${itemId}-${periodId}` : undefined}
            />
            {percentError && (
              <p id={`pc-pct-err-${itemId}-${periodId}`} className="text-danger-strong text-xs">
                {percentError}
              </p>
            )}
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor={`pc-date-${itemId}-${periodId}`} className="text-[13px]">
              วันที่ทำงาน (ในเดือนนี้)
            </Label>
            <Input
              id={`pc-date-${itemId}-${periodId}`}
              type="date"
              value={scheduledDate}
              onChange={(e) => setScheduledDate(e.target.value)}
            />
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor={`pc-note-${itemId}-${periodId}`} className="text-[13px]">
              หมายเหตุ
            </Label>
            <Textarea
              id={`pc-note-${itemId}-${periodId}`}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
              maxLength={2000}
            />
          </div>

          {!effectiveMarkType && (
            <p className="text-warning-text text-xs">
              ยังไม่มีประเภท mark ที่เปิดใช้ — เปิดได้ที่หน้าตั้งค่า Work Progress
            </p>
          )}

          <div className="flex items-center justify-between gap-2 pt-1">
            {mark ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-danger-strong hover:text-danger-strong"
                onClick={handleClear}
                disabled={clearMut.isPending}
              >
                <X className="size-4" />
                ลบ mark
              </Button>
            ) : (
              <span />
            )}
            <div className="flex gap-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setOpen(false)}>
                ยกเลิก
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={handleSave}
                disabled={!effectiveMarkType || setMut.isPending}
              >
                {setMut.isPending ? 'กำลังบันทึก...' : 'บันทึก'}
              </Button>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}

export const PeriodCell = memo(PeriodCellInner)
