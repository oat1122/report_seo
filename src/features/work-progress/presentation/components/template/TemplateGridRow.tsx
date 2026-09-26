'use client'

import { memo } from 'react'
import { GripVertical, ListChecks, MoreHorizontal, Pencil, Trash2 } from 'lucide-react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import { TemplatePeriodCell } from './TemplatePeriodCell'
import type {
  WorkProgressCategory,
  WorkProgressMarkType,
  WorkProgressTemplateItem,
} from '@/features/work-progress'
import {
  parseTemplateDefaultPeriods,
  type TemplateDefaultPeriods,
} from '../../../domain/policies/template-default-periods'

export interface TemplatePeriodColumn {
  seq: number
  label: string
}

interface TemplateGridRowProps {
  item: WorkProgressTemplateItem
  category: WorkProgressCategory | undefined
  periods: TemplatePeriodColumn[]
  markTypes: WorkProgressMarkType[]
  disabled?: boolean
  onEdit: () => void
  onDelete: () => void
  onChangePeriodMark: (itemId: string, nextDefaultPeriods: TemplateDefaultPeriods) => void
}

/**
 * แถว item ใน template builder
 * - การ์ดแคบ (มือถือ): การ์ด 3 คอลัมน์ [ลาก | กิจกรรม | ตัวเลือก] + ตารางเดือน 6 ช่องต่อแถว
 * - ตั้งแต่ @3xl: แถวกริดตาม --tpl-cols ที่ตั้งไว้บน container (ลำดับ DOM = ลำดับคอลัมน์)
 */
function TemplateGridRowInner({
  item,
  category,
  periods,
  markTypes,
  disabled,
  onEdit,
  onDelete,
  onChangePeriodMark,
}: TemplateGridRowProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.id,
  })

  const defaults = parseTemplateDefaultPeriods(item.defaultPeriods)

  const handleCellChange = (seq: number, markTypeId: string | null) => {
    const next: TemplateDefaultPeriods = { ...defaults }
    if (markTypeId) {
      next[String(seq)] = { markTypeId }
    } else {
      delete next[String(seq)]
    }
    onChangePeriodMark(item.id, next)
  }

  const subtaskCount = item.subtasks?.length ?? 0

  return (
    <div
      ref={setNodeRef}
      role="row"
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(
        'border-glass-border bg-glass-tile grid grid-cols-[44px_minmax(0,1fr)_44px] gap-x-2 gap-y-3 rounded-2xl border p-2 text-sm',
        '@3xl:border-border/80 @3xl:[grid-template-columns:var(--tpl-cols)] @3xl:items-stretch @3xl:gap-0 @3xl:rounded-none @3xl:border-0 @3xl:border-b @3xl:bg-transparent @3xl:p-0 @3xl:last:border-b-0',
        isDragging && 'shadow-popover bg-background @3xl:bg-background relative z-10',
      )}
    >
      <div
        role="cell"
        className="col-start-1 row-start-1 flex items-start justify-center @3xl:col-auto @3xl:row-auto @3xl:items-center"
      >
        <button
          type="button"
          className="text-muted-foreground hover:text-foreground hover:bg-muted focus-visible:ring-ring/60 flex size-11 cursor-grab touch-none items-center justify-center rounded-xl outline-none focus-visible:ring-2 active:cursor-grabbing disabled:cursor-not-allowed disabled:opacity-50"
          aria-label={`ลากเพื่อเรียงลำดับ ${item.activity}`}
          disabled={disabled}
          {...attributes}
          {...listeners}
        >
          <GripVertical className="size-4" aria-hidden />
        </button>
      </div>

      <div
        role="cell"
        className="col-start-2 row-start-1 flex min-w-0 flex-col gap-1 py-1.5 @3xl:col-auto @3xl:row-auto @3xl:justify-center @3xl:px-3.5 @3xl:py-3"
      >
        <span className="text-text-secondary inline-flex max-w-full min-w-0 items-center gap-1.5 text-xs">
          <span
            aria-hidden
            className="border-foreground/10 size-2 shrink-0 rounded-[3px] border"
            style={{ backgroundColor: category?.color ?? 'var(--muted)' }}
          />
          <span className="truncate">{category?.name ?? 'ไม่มีหมวด'}</span>
        </span>
        <span className="text-sm leading-snug font-medium break-words">{item.activity}</span>
        {item.description && (
          <span className="text-text-secondary line-clamp-2 text-xs">{item.description}</span>
        )}
        {subtaskCount > 0 && (
          <span className="text-text-secondary flex items-center gap-1 text-xs">
            <ListChecks className="size-3" aria-hidden />
            {subtaskCount} งานย่อย
          </span>
        )}
      </div>

      <div
        role="cell"
        className="text-text-secondary col-start-2 row-start-2 -mt-2 flex items-center text-[13px] @3xl:col-auto @3xl:row-auto @3xl:mt-0 @3xl:px-3.5 @3xl:py-3"
      >
        <span className="@3xl:hidden">ระยะ:&nbsp;</span>
        {item.duration ?? '—'}
      </div>

      {/* มือถือ: ตารางเดือน 6 ช่อง/แถว · @3xl: display:contents ให้แต่ละช่องเป็นคอลัมน์ของแถว */}
      <div className="col-span-3 row-start-3 grid grid-cols-6 gap-1.5 @3xl:contents">
        {periods.map((p) => (
          <div
            key={p.seq}
            role="cell"
            className="bg-background/60 flex flex-col items-center gap-0.5 rounded-xl pt-1 @3xl:rounded-none @3xl:bg-transparent @3xl:pt-0 dark:bg-white/5 @3xl:dark:bg-transparent"
          >
            <span aria-hidden className="text-text-secondary text-[11px] tabular-nums @3xl:hidden">
              ม.{p.seq}
            </span>
            <TemplatePeriodCell
              markTypeId={defaults[String(p.seq)]?.markTypeId ?? null}
              markTypes={markTypes}
              periodLabel={p.label}
              disabled={disabled}
              onChange={(markTypeId) => handleCellChange(p.seq, markTypeId)}
            />
          </div>
        ))}
      </div>

      <div
        role="cell"
        className="col-start-3 row-start-1 flex items-start justify-center @3xl:col-auto @3xl:row-auto @3xl:items-center"
      >
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              size="icon"
              variant="outline"
              className="@3xl:size-9 @3xl:rounded-[10px]"
              aria-label={`ตัวเลือกของ ${item.activity}`}
              title="ตัวเลือก"
              disabled={disabled}
            >
              <MoreHorizontal className="size-4" aria-hidden />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onEdit}>
              <Pencil className="size-4" aria-hidden />
              แก้ไข
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onDelete} variant="destructive">
              <Trash2 className="size-4" aria-hidden />
              ลบ
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}

export const TemplateGridRow = memo(TemplateGridRowInner)
