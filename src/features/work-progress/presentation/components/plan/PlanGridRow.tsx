'use client'

import { memo, useMemo } from 'react'
import { GripVertical, MoreHorizontal, Pencil, Repeat, Trash2 } from 'lucide-react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { PeriodCell } from './PeriodCell'
import { StatusChip } from './StatusChip'
import { tintOf } from './planDisplay'
import { useStatuses } from '../../hooks/useMasterTables'
import { useUpdateItem } from '../../hooks/useItemMutations'
import {
  deriveRecurrenceOccurrences,
  readItemRecurrence,
} from '@/features/work-progress/domain/policies/recurrence'
import type { WorkProgressItemWithMarks, WorkProgressPeriod } from '@/features/work-progress'

interface PlanGridRowProps {
  userId: string
  planId: string
  item: WorkProgressItemWithMarks
  periods: WorkProgressPeriod[]
  gridTemplate: string
  currentPeriodId: string | null
  selected: boolean
  onToggleSelect: (id: string) => void
  onEdit: (item: WorkProgressItemWithMarks) => void
  onDelete: (item: WorkProgressItemWithMarks) => void
  onOpenDetail: (item: WorkProgressItemWithMarks) => void
  readOnly?: boolean
}

function PlanGridRowInner({
  userId,
  planId,
  item,
  periods,
  gridTemplate,
  currentPeriodId,
  selected,
  onToggleSelect,
  onEdit,
  onDelete,
  onOpenDetail,
  readOnly,
}: PlanGridRowProps) {
  const sortable = useSortable({ id: item.id, disabled: readOnly })
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = sortable
  const { data: statuses } = useStatuses()
  const updateMut = useUpdateItem()

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    gridTemplateColumns: gridTemplate,
  } as React.CSSProperties

  const marksByPeriod = new Map(item.periodMarks.map((m) => [m.periodId, m]))

  // งานทำซ้ำ: คำนวณวันที่แนะนำของแต่ละเดือนจากกฎ (เช่น "ทุกวันที่ 14") เพื่อ prefill cell
  const suggestedDates = useMemo(() => {
    const rule = readItemRecurrence(item)
    if (!rule) return new Map<string, Date>()
    return deriveRecurrenceOccurrences(periods, rule)
  }, [item, periods])

  const subtaskPercent = useMemo(() => {
    const total = item.subtasks.length
    if (total === 0) return null
    const done = item.subtasks.filter((s) => s.isDone).length
    return Math.round((done / total) * 100)
  }, [item.subtasks])

  const statusOptions = useMemo(() => {
    const list = statuses ?? []
    const active = list.filter((s) => s.isActive)
    const hasCurrent = active.some((s) => s.id === item.status.id)
    if (hasCurrent) return active
    const current = list.find((s) => s.id === item.status.id)
    return current ? [...active, current] : active
  }, [statuses, item.status.id])

  const handleStatusChange = (statusId: string) => {
    if (statusId === item.status.id) return
    updateMut.mutate({
      userId,
      planId,
      itemId: item.id,
      body: { statusId },
    })
  }

  return (
    <div
      ref={setNodeRef}
      role="row"
      style={style}
      className={cn(
        'border-border/80 grid border-b transition-colors last:border-b-0',
        selected ? 'bg-info-subtle/70' : 'hover:bg-foreground/[0.025]',
        isDragging && 'bg-popover shadow-popover relative z-10 opacity-90',
      )}
    >
      {!readOnly && (
        <>
          {/* Select */}
          <div role="cell" className="flex items-center justify-center">
            <Checkbox
              checked={selected}
              onCheckedChange={() => onToggleSelect(item.id)}
              aria-label={`เลือก ${item.activity}`}
            />
          </div>

          {/* Drag */}
          <div role="cell" className="flex items-center justify-center">
            <button
              type="button"
              aria-label={`ลากเพื่อเรียง ${item.activity}`}
              className="text-muted-foreground hover:text-foreground focus-visible:ring-ring/70 flex h-full min-h-11 w-full cursor-grab items-center justify-center rounded-[10px] outline-none focus-visible:ring-[3px] active:cursor-grabbing"
              {...attributes}
              {...listeners}
            >
              <GripVertical className="size-4" />
            </button>
          </div>
        </>
      )}

      {/* Activity — หมวด · ระยะ อยู่บรรทัดบน */}
      <div role="cell" className="flex min-w-0 items-stretch py-1.5 pr-2">
        <button
          type="button"
          onClick={() => onOpenDetail(item)}
          className="hover:bg-foreground/[0.04] focus-visible:ring-ring/70 flex min-w-0 flex-1 flex-col justify-center gap-1 rounded-[10px] px-2.5 py-1.5 text-left transition-colors outline-none focus-visible:ring-[3px]"
        >
          <span className="text-text-secondary flex min-w-0 items-center gap-1.5 text-[11px]">
            <span
              aria-hidden
              className="bg-muted-foreground size-2 shrink-0 rounded-[3px]"
              style={item.category.color ? { backgroundColor: item.category.color } : undefined}
            />
            <span className="truncate">
              {item.category.name}
              {item.duration ? ` · ${item.duration}` : ''}
            </span>
          </span>
          <span className="flex min-w-0 items-center gap-1.5 text-sm font-medium">
            <span className="line-clamp-2">{item.activity}</span>
            {item.isRecurring && (
              <Repeat
                className="text-info-strong size-3.5 shrink-0"
                aria-label="งานทำซ้ำรายเดือน"
              />
            )}
          </span>
          {item.description && (
            <span className="text-text-secondary line-clamp-1 text-xs">{item.description}</span>
          )}
        </button>
      </div>

      {/* Status */}
      <div role="cell" className="flex min-w-0 items-center px-2">
        {readOnly ? (
          <StatusChip name={item.status.name} color={item.status.color} />
        ) : (
          <Select
            value={item.status.id}
            onValueChange={handleStatusChange}
            disabled={updateMut.isPending || statusOptions.length === 0}
          >
            <SelectTrigger
              size="sm"
              aria-label={`เปลี่ยนสถานะ ${item.activity}`}
              className={cn(
                'text-foreground h-8 max-w-full rounded-full border-0 px-2.5 text-xs font-medium shadow-none',
                !item.status.color && 'bg-muted',
              )}
              style={
                item.status.color ? { backgroundColor: tintOf(item.status.color, 20) } : undefined
              }
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  <span
                    className="inline-block size-2 shrink-0 rounded-full"
                    style={{
                      backgroundColor: s.color ?? 'var(--muted-foreground)',
                    }}
                    aria-hidden
                  />
                  <span className="truncate">{s.name}</span>
                  {!s.isActive && <span className="text-muted-foreground text-[10px]">(ปิด)</span>}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {/* Period cells */}
      {periods.map((p) => (
        <div
          key={p.id}
          role="cell"
          className={cn(
            'flex items-center justify-center px-0.5 py-1',
            p.id === currentPeriodId && 'bg-info/10',
          )}
        >
          <PeriodCell
            userId={userId}
            planId={planId}
            itemId={item.id}
            periodId={p.id}
            periodLabel={p.label}
            mark={marksByPeriod.get(p.id)}
            subtaskPercent={subtaskPercent}
            statusColor={item.status.color}
            defaultScheduledDate={suggestedDates.get(p.id) ?? null}
            readOnly={readOnly}
          />
        </div>
      ))}

      {/* Actions */}
      {!readOnly && (
        <div role="cell" className="flex items-center justify-center">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="icon-sm" variant="outline" aria-label={`เมนูของ ${item.activity}`}>
                <MoreHorizontal className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(item)}>
                <Pencil className="size-4" />
                แก้ไข item
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDelete(item)} variant="destructive">
                <Trash2 className="size-4" />
                ลบ
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}
    </div>
  )
}

export const PlanGridRow = memo(PlanGridRowInner)
