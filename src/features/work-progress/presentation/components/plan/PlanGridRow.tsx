'use client'

import { memo, useMemo } from 'react'
import { GripVertical, MoreHorizontal, Pencil, PanelRight, Trash2 } from 'lucide-react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
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
import { useStatuses } from '../../hooks/useMasterTables'
import { useUpdateItem } from '../../hooks/useItemMutations'
import type { WorkProgressItemWithMarks, WorkProgressPeriod } from '@/features/work-progress'

interface PlanGridRowProps {
  userId: string
  planId: string
  item: WorkProgressItemWithMarks
  periods: WorkProgressPeriod[]
  gridTemplate: string
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
  const rowBg = selected ? 'bg-secondary/20' : 'bg-background'

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
      style={style}
      className={cn('border-border grid border-b', rowBg, isDragging && 'z-10 opacity-50')}
    >
      {/* Select */}
      <div className="border-border flex items-center justify-center border-r">
        {!readOnly && (
          <Checkbox
            checked={selected}
            onCheckedChange={() => onToggleSelect(item.id)}
            aria-label={`เลือก ${item.activity}`}
          />
        )}
      </div>

      {/* Drag */}
      <div className="border-border flex items-center justify-center border-r">
        {!readOnly && (
          <button
            type="button"
            aria-label="ลากเพื่อเรียง"
            className="text-muted-foreground hover:text-foreground flex h-full w-full cursor-grab items-center justify-center active:cursor-grabbing"
            {...attributes}
            {...listeners}
          >
            <GripVertical className="size-4" />
          </button>
        )}
      </div>

      {/* Category */}
      <div className="border-border flex items-center gap-2 border-r px-3 py-2">
        <span
          className="inline-block size-2.5 rounded-sm"
          style={
            item.category.color
              ? { backgroundColor: item.category.color }
              : { backgroundColor: 'var(--muted)' }
          }
          aria-hidden
        />
        <span className="truncate text-xs">{item.category.name}</span>
      </div>

      {/* Activity */}
      <button
        type="button"
        onClick={() => onOpenDetail(item)}
        className="border-border hover:bg-muted/30 focus-visible:bg-muted/50 flex flex-col justify-center border-r px-3 py-2 text-left transition"
      >
        <span className="line-clamp-2 text-sm font-medium">{item.activity}</span>
        {item.description && (
          <span className="text-muted-foreground line-clamp-1 text-xs">{item.description}</span>
        )}
      </button>

      {/* Status */}
      <div className="border-border flex items-center border-r px-2 py-1.5">
        {readOnly ? (
          <Badge
            variant="outline"
            style={
              item.status.color
                ? { borderColor: item.status.color, color: item.status.color }
                : undefined
            }
            className="text-xs"
          >
            {item.status.name}
          </Badge>
        ) : (
          <Select
            value={item.status.id}
            onValueChange={handleStatusChange}
            disabled={updateMut.isPending || statusOptions.length === 0}
          >
            <SelectTrigger
              size="sm"
              aria-label="เปลี่ยนสถานะ"
              className="hover:bg-muted/50 w-full border-transparent bg-transparent text-xs shadow-none focus-visible:ring-1"
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

      {/* Duration */}
      <div className="border-border text-muted-foreground flex items-center border-r px-3 py-2 text-xs">
        {item.duration ?? '—'}
      </div>

      {/* Period cells */}
      {periods.map((p) => (
        <div key={p.id} className="border-border flex items-center justify-center border-r">
          <PeriodCell
            userId={userId}
            planId={planId}
            itemId={item.id}
            periodId={p.id}
            mark={marksByPeriod.get(p.id)}
            subtaskPercent={subtaskPercent}
            statusColor={item.status.color}
            readOnly={readOnly}
          />
        </div>
      ))}

      {/* Actions */}
      <div className="border-border flex items-center justify-center border-l">
        {!readOnly && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="icon" variant="ghost" aria-label="เมนู">
                <MoreHorizontal className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onOpenDetail(item)}>
                <PanelRight className="size-4" />
                เปิด detail
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit(item)}>
                <Pencil className="size-4" />
                แก้ไข
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDelete(item)} variant="destructive">
                <Trash2 className="size-4" />
                ลบ
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </div>
  )
}

export const PlanGridRow = memo(PlanGridRowInner)
