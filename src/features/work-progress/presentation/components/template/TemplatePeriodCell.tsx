'use client'

import { memo, useState } from 'react'
import { Check, X } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { WorkProgressMarkType } from '@/features/work-progress'

interface TemplatePeriodCellProps {
  markTypeId: string | null
  markTypes: WorkProgressMarkType[]
  disabled?: boolean
  onChange: (markTypeId: string | null) => void
}

function TemplatePeriodCellInner({
  markTypeId,
  markTypes,
  disabled,
  onChange,
}: TemplatePeriodCellProps) {
  const [open, setOpen] = useState(false)
  const active = markTypes.find((m) => m.id === markTypeId) ?? null
  const bgStyle = active?.color ? { backgroundColor: active.color } : undefined

  if (disabled) {
    return (
      <div
        className={cn(
          'flex h-full w-full items-center justify-center text-xs',
          !active && 'text-muted-foreground/40',
        )}
        style={bgStyle}
      >
        {active ? <Check className="size-4 text-white drop-shadow" /> : '·'}
      </div>
    )
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            'hover:ring-primary/40 h-full w-full cursor-pointer transition hover:ring-2',
            !active && 'bg-muted/50',
          )}
          style={bgStyle}
          aria-label={active ? `mark: ${active.name}` : 'ว่าง'}
        >
          {active ? (
            <Check className="mx-auto size-4 text-white drop-shadow" />
          ) : (
            <span className="text-muted-foreground/40 text-xs">·</span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-56 p-2" align="start">
        <div className="flex flex-col gap-1">
          <p className="text-muted-foreground px-2 pb-1 text-xs font-medium">ประเภท mark</p>
          {markTypes.length === 0 ? (
            <p className="text-muted-foreground px-2 py-1 text-xs">
              ยังไม่มี mark type — แอดมินต้องเพิ่มก่อน
            </p>
          ) : (
            markTypes.map((m) => (
              <button
                key={m.id}
                type="button"
                className={cn(
                  'hover:bg-muted flex items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm',
                  m.id === markTypeId && 'bg-muted',
                )}
                onClick={() => {
                  onChange(m.id)
                  setOpen(false)
                }}
              >
                <span
                  className="border-border inline-block size-3 rounded-sm border"
                  style={m.color ? { backgroundColor: m.color } : undefined}
                />
                <span className="flex-1 truncate">{m.name}</span>
                {m.id === markTypeId && <Check className="size-3.5" />}
              </button>
            ))
          )}
          {active && (
            <>
              <div className="border-border mt-1 border-t" />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="justify-start"
                onClick={() => {
                  onChange(null)
                  setOpen(false)
                }}
              >
                <X className="size-3.5" />
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
