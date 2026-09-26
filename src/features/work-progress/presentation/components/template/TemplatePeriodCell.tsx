'use client'

import { memo, useState, type CSSProperties } from 'react'
import { Check, X } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { WorkProgressMarkType } from '@/features/work-progress'

interface TemplatePeriodCellProps {
  markTypeId: string | null
  markTypes: WorkProgressMarkType[]
  /** ชื่อเดือนเต็ม เช่น "เดือนที่ 3" — ใช้เป็น label ของปุ่ม */
  periodLabel: string
  disabled?: boolean
  onChange: (markTypeId: string | null) => void
}

/** กล่องเส้นประตามสีของ mark type (สีเป็นข้อมูลจาก master table) */
export function markSwatchStyle(color: string | null | undefined): CSSProperties | undefined {
  if (!color) return undefined
  return {
    borderColor: color,
    backgroundColor: `color-mix(in srgb, ${color} 16%, transparent)`,
  }
}

function MarkVisual({ active }: { active: WorkProgressMarkType | null }) {
  if (!active) {
    return <span aria-hidden className="bg-muted-foreground/40 inline-block size-1 rounded-full" />
  }
  return (
    <span
      aria-hidden
      className={cn(
        'inline-block size-[22px] rounded-[7px] border-2 border-dashed',
        !active.color && 'border-info bg-info-subtle/60',
      )}
      style={markSwatchStyle(active.color)}
    />
  )
}

function TemplatePeriodCellInner({
  markTypeId,
  markTypes,
  periodLabel,
  disabled,
  onChange,
}: TemplatePeriodCellProps) {
  const [open, setOpen] = useState(false)
  const active = markTypes.find((m) => m.id === markTypeId) ?? null
  const stateLabel = active ? active.name : 'ยังไม่กำหนด'

  if (disabled) {
    return (
      <div
        className="flex h-11 w-full items-center justify-center @3xl:h-full @3xl:min-h-11"
        title={`${periodLabel}: ${stateLabel}`}
      >
        <MarkVisual active={active} />
        <span className="sr-only">
          {periodLabel}: {stateLabel}
        </span>
      </div>
    )
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="hover:bg-info-subtle/70 focus-visible:ring-ring/60 data-[state=open]:bg-info-subtle flex h-11 w-full cursor-pointer items-center justify-center rounded-lg transition-colors outline-none focus-visible:ring-2 @3xl:h-full @3xl:min-h-11 @3xl:rounded-none"
          aria-label={`${periodLabel}: ${stateLabel} — เลือก mark`}
          title={`${periodLabel}: ${stateLabel}`}
        >
          <MarkVisual active={active} />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-60 rounded-[14px] p-2" align="start">
        <div className="flex flex-col gap-1">
          <p className="text-text-secondary px-2 pb-1 text-xs font-medium">
            ประเภท mark · {periodLabel}
          </p>
          {markTypes.length === 0 ? (
            <p className="text-text-secondary px-2 py-1 text-xs">
              ยังไม่มี mark type ที่เปิดใช้ — เพิ่มใน Master Tables ก่อน
            </p>
          ) : (
            markTypes.map((m) => {
              const selected = m.id === markTypeId
              return (
                <button
                  key={m.id}
                  type="button"
                  aria-pressed={selected}
                  className={cn(
                    'hover:bg-muted focus-visible:ring-ring/60 flex min-h-11 items-center gap-2.5 rounded-[10px] px-2 text-left text-sm outline-none focus-visible:ring-2 sm:min-h-9',
                    selected && 'bg-muted font-medium',
                  )}
                  onClick={() => {
                    onChange(m.id)
                    setOpen(false)
                  }}
                >
                  <span
                    aria-hidden
                    className={cn(
                      'inline-block size-4 shrink-0 rounded-[5px] border-2 border-dashed',
                      !m.color && 'border-info bg-info-subtle/60',
                    )}
                    style={markSwatchStyle(m.color)}
                  />
                  <span className="flex-1 truncate">{m.name}</span>
                  {selected && <Check className="size-3.5" aria-hidden />}
                </button>
              )
            })
          )}
          {active && (
            <>
              <div className="border-border mt-1 border-t" />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="justify-start max-sm:h-11"
                onClick={() => {
                  onChange(null)
                  setOpen(false)
                }}
              >
                <X className="size-3.5" aria-hidden />
                ลบ mark
              </Button>
            </>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}

export const TemplatePeriodCell = memo(TemplatePeriodCellInner)
