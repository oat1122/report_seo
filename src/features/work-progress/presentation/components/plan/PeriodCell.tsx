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
import type { WorkProgressPeriodMarkWithType } from '@/features/work-progress'

interface PeriodCellProps {
  userId: string
  planId: string
  itemId: string
  periodId: string
  mark: WorkProgressPeriodMarkWithType | undefined
  subtaskPercent: number | null
  statusColor: string | null
  readOnly?: boolean
}

function PeriodCellInner({
  userId,
  planId,
  itemId,
  periodId,
  mark,
  subtaskPercent,
  statusColor,
  readOnly,
}: PeriodCellProps) {
  const [open, setOpen] = useState(false)
  const [percent, setPercent] = useState<string>(
    mark?.progressPercent != null ? String(mark.progressPercent) : '',
  )
  const [note, setNote] = useState(mark?.note ?? '')

  const { data: markTypes } = useMarkTypes()
  const setMut = useSetPeriodMark()
  const clearMut = useClearPeriodMark()

  const reset = () => {
    setPercent(mark?.progressPercent != null ? String(mark.progressPercent) : '')
    setNote(mark?.note ?? '')
  }

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
  const bgStyle = markColor ? { backgroundColor: markColor } : undefined
  const iconCls = markColor ? 'text-white drop-shadow' : 'text-foreground'

  if (readOnly) {
    return (
      <div
        className={cn(
          'flex h-full w-full items-center justify-center text-xs',
          mark && !markColor && 'bg-muted',
          !mark && 'text-muted-foreground/40',
        )}
        style={bgStyle}
        title={
          mark
            ? `${mark.markType.name}${subtaskPercent != null ? ` · ${subtaskPercent}%` : ''}`
            : ''
        }
      >
        {mark ? (
          subtaskPercent != null ? (
            <span className={cn('font-medium', iconCls)}>{subtaskPercent}%</span>
          ) : (
            <Check className={cn('size-4', iconCls)} />
          )
        ) : (
          '·'
        )}
      </div>
    )
  }

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            'hover:ring-primary/40 h-full w-full cursor-pointer transition hover:ring-2',
            mark && !markColor && 'bg-muted',
            !mark && 'bg-muted/50',
          )}
          style={bgStyle}
          aria-label={mark ? `mark: ${mark.markType.name}` : 'ว่าง'}
        >
          {mark ? (
            subtaskPercent != null ? (
              <span className={cn('text-xs font-medium', iconCls)}>{subtaskPercent}%</span>
            ) : (
              <Check className={cn('mx-auto size-4', iconCls)} />
            )
          ) : (
            <span className="text-muted-foreground/40 text-xs">·</span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-72" align="start">
        <div className="grid gap-3">
          <div className="grid grid-cols-2 gap-2">
            <div className="grid gap-1">
              <Label htmlFor={`pc-pct-${itemId}-${periodId}`} className="text-xs">
                %
              </Label>
              <Input
                id={`pc-pct-${itemId}-${periodId}`}
                type="number"
                min={0}
                max={100}
                value={percent}
                onChange={(e) => setPercent(e.target.value)}
                placeholder="0-100"
                className="h-8"
              />
            </div>
          </div>

          <div className="grid gap-1">
            <Label htmlFor={`pc-note-${itemId}-${periodId}`} className="text-xs">
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

          <div className="flex justify-between gap-2 pt-1">
            {mark ? (
              <Button type="button" variant="ghost" size="sm" onClick={handleClear}>
                <X className="size-4" />
                ลบ
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
                บันทึก
              </Button>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}

export const PeriodCell = memo(PeriodCellInner)
