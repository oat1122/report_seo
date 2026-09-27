'use client'

import { useCallback, useMemo, useState } from 'react'
import { ClipboardList, Plus, RefreshCw } from 'lucide-react'
import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import { SortableContext, arrayMove, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { AnimatePresence } from '@/components/motion'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Skeleton } from '@/components/ui/skeleton'
import { ConfirmAlert } from '@/components/shared/ConfirmAlert'
import { cn } from '@/lib/utils'
import { PlanGridRow } from './PlanGridRow'
import { PlanItemCards } from './PlanItemCards'
import { ItemEditDialog } from './ItemEditDialog'
import { ItemDetailSheet } from '../item/ItemDetailSheet'
import { BulkActionToolbar } from './BulkActionToolbar'
import { isCurrentPeriod, splitPeriodLabel } from './planDisplay'
import { useWorkProgressPlan } from '../../hooks/useWorkProgressPlan'
import { useDeleteItem, useReorderItems } from '../../hooks/useItemMutations'
import type { WorkProgressItemWithMarks, WorkProgressPeriod } from '@/features/work-progress'

interface PlanGridProps {
  userId: string
  planId: string
  readOnly?: boolean
}

// ความกว้างคอลัมน์ (px) — แผน 12 เดือนพอดีการ์ดที่จอ 1440 · เกินนั้นเลื่อนแนวนอนภายในการ์ด
const COL_WIDTH = {
  select: 40,
  drag: 32,
  activityMin: 216,
  status: 168,
  period: 40,
  actions: 48,
} as const

// โหมดอ่านอย่างเดียว (ลูกค้า) — แสดงเป็นตารางตั้งแต่ xl, ต่ำกว่านั้นเป็นการ์ด
const READONLY_WIDTH = {
  activityMin: 220,
  status: 140,
  period: 38,
} as const

export function PlanGrid({ userId, planId, readOnly }: PlanGridProps) {
  const { data, isLoading, isError, refetch, isRefetching } = useWorkProgressPlan(userId, planId)
  const deleteMut = useDeleteItem()
  const reorderMut = useReorderItems()

  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<WorkProgressItemWithMarks | null>(null)
  const [detailItem, setDetailItem] = useState<WorkProgressItemWithMarks | null>(null)

  const [localOrder, setLocalOrder] = useState<string[] | null>(null)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  // เวลาอ้างอิงสำหรับไฮไลต์ "เดือนนี้" — คงที่ตลอดอายุ component
  const [now] = useState(() => new Date())

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }))

  const periods = useMemo<WorkProgressPeriod[]>(
    () => (data?.periods ?? []).slice().sort((a, b) => a.seq - b.seq),
    [data?.periods],
  )

  const currentPeriod = useMemo(
    () => periods.find((p) => isCurrentPeriod(p, now)) ?? null,
    [periods, now],
  )

  const items = useMemo<WorkProgressItemWithMarks[]>(() => {
    const base = (data?.items ?? []).slice().sort((a, b) => a.orderIndex - b.orderIndex)
    if (!localOrder) return base
    const byId = new Map(base.map((i) => [i.id, i]))
    return localOrder.map((id) => byId.get(id)).filter((i): i is WorkProgressItemWithMarks => !!i)
  }, [data?.items, localOrder])

  // legend จากสถานะที่มีอยู่จริงในแผน (สีช่อง = สีสถานะของ item)
  const legend = useMemo(() => {
    const seen = new Map<string, { name: string; color: string | null }>()
    for (const i of items) {
      if (!seen.has(i.status.id))
        seen.set(i.status.id, { name: i.status.name, color: i.status.color })
    }
    return Array.from(seen.entries())
  }, [items])

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  const toggleSelectAll = useCallback(() => {
    setSelectedIds((prev) => {
      if (prev.size === items.length) return new Set()
      return new Set(items.map((i) => i.id))
    })
  }, [items])

  const clearSelection = useCallback(() => setSelectedIds(new Set()), [])

  const openDetail = useCallback((i: WorkProgressItemWithMarks) => setDetailItem(i), [])
  const requestDelete = useCallback((i: WorkProgressItemWithMarks) => setDeleteTarget(i), [])

  const gridTemplate = readOnly
    ? `minmax(${READONLY_WIDTH.activityMin}px, 1fr) ${READONLY_WIDTH.status}px repeat(${periods.length}, ${READONLY_WIDTH.period}px)`
    : `${COL_WIDTH.select}px ${COL_WIDTH.drag}px minmax(${COL_WIDTH.activityMin}px, 1fr) ${COL_WIDTH.status}px repeat(${periods.length}, ${COL_WIDTH.period}px) ${COL_WIDTH.actions}px`
  const gridMinWidth = readOnly
    ? READONLY_WIDTH.activityMin + READONLY_WIDTH.status + periods.length * READONLY_WIDTH.period
    : COL_WIDTH.select +
      COL_WIDTH.drag +
      COL_WIDTH.activityMin +
      COL_WIDTH.status +
      periods.length * COL_WIDTH.period +
      COL_WIDTH.actions
  const allSelected = items.length > 0 && selectedIds.size === items.length
  const someSelected = selectedIds.size > 0 && selectedIds.size < items.length

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const ids = items.map((i) => i.id)
    const oldIdx = ids.indexOf(active.id as string)
    const newIdx = ids.indexOf(over.id as string)
    if (oldIdx < 0 || newIdx < 0) return
    const next = arrayMove(ids, oldIdx, newIdx)
    setLocalOrder(next)
    reorderMut.mutate(
      {
        userId,
        planId,
        body: {
          order: next.map((itemId, idx) => ({ itemId, orderIndex: idx })),
        },
      },
      {
        onSettled: () => setLocalOrder(null),
      },
    )
  }

  const openCreate = () => setDialogOpen(true)

  if (isLoading) {
    return (
      <Card className="gap-3 px-5 sm:px-6" aria-busy="true" aria-label="กำลังโหลดตารางงาน">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
      </Card>
    )
  }

  if (isError) {
    return (
      <Card className="items-center gap-3 px-6 py-10 text-center" role="alert">
        <p className="text-sm font-medium">โหลดตารางงานไม่สำเร็จ</p>
        <p className="text-text-secondary text-[13px]">
          ตรวจสอบการเชื่อมต่ออินเทอร์เน็ต แล้วลองโหลดใหม่อีกครั้ง
        </p>
        <Button variant="outline" onClick={() => refetch()} disabled={isRefetching}>
          <RefreshCw className={cn('size-4', isRefetching && 'animate-spin')} />
          ลองใหม่
        </Button>
      </Card>
    )
  }

  if (!data) return null

  const headingId = `plan-grid-${planId}`
  const description = readOnly
    ? `${items.length} รายการ · แต่ละช่อง = งานของรอบนั้น${currentPeriod ? ` · ไฮไลต์ = เดือนนี้ (${splitPeriodLabel(currentPeriod.label)[0]})` : ''}`
    : `${items.length} รายการ · คลิกช่องเพื่อตั้ง mark / % / วันที่ · ลากที่จับเพื่อเรียงลำดับ`

  const table = (
    <div className="border-border/70 max-h-[72vh] overflow-auto rounded-[16px] border bg-white/50 dark:bg-white/[0.03]">
      <div
        role="table"
        aria-labelledby={headingId}
        aria-rowcount={items.length + 1}
        style={{ minWidth: gridMinWidth }}
      >
        {/* Header — ติดบนเมื่อเลื่อนในตาราง */}
        <div role="rowgroup" className="sticky top-0 z-20">
          <div
            role="row"
            className="border-border bg-muted text-text-secondary grid border-b text-xs font-medium"
            style={{ gridTemplateColumns: gridTemplate }}
          >
            {!readOnly && (
              <>
                <div role="columnheader" className="flex items-center justify-center py-2.5">
                  {items.length > 0 && (
                    <Checkbox
                      checked={allSelected ? true : someSelected ? 'indeterminate' : false}
                      onCheckedChange={toggleSelectAll}
                      aria-label="เลือกทั้งหมด"
                    />
                  )}
                </div>
                <div role="columnheader" aria-label="ลำดับ" />
              </>
            )}
            <div role="columnheader" className="flex items-center px-4 py-2.5">
              กิจกรรม
            </div>
            <div role="columnheader" className="flex items-center px-3 py-2.5">
              สถานะ
            </div>
            {periods.map((p) => {
              const [head, tail] = splitPeriodLabel(p.label)
              const isCurrent = p.id === currentPeriod?.id
              return (
                <div
                  key={p.id}
                  role="columnheader"
                  aria-label={p.label}
                  className={cn(
                    'flex flex-col items-center justify-center px-1 py-2 text-center leading-tight',
                    isCurrent && 'bg-info/15 text-foreground',
                  )}
                >
                  <span className={cn(isCurrent && 'font-semibold')}>{head}</span>
                  {tail && <span className="text-[10px] font-normal">{tail}</span>}
                </div>
              )
            })}
            {!readOnly && <div role="columnheader" aria-label="การจัดการ" />}
          </div>
        </div>

        {/* Rows */}
        <div role="rowgroup">
          {items.length === 0 ? (
            <div role="row">
              <div
                role="cell"
                className="text-text-secondary flex flex-col items-center gap-2 px-6 py-12 text-center text-sm"
              >
                <ClipboardList aria-hidden className="text-info-strong size-6" />
                {readOnly
                  ? 'ยังไม่มีงานในแผนนี้ — ทีมจะเพิ่มรายการเมื่อเริ่มดำเนินการ'
                  : 'ยังไม่มี item — กด “เพิ่ม item” เพื่อเริ่มวางแผน'}
              </div>
            </div>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={items.map((i) => i.id)}
                strategy={verticalListSortingStrategy}
              >
                {items.map((item) => (
                  <PlanGridRow
                    key={item.id}
                    userId={userId}
                    planId={planId}
                    item={item}
                    periods={periods}
                    gridTemplate={gridTemplate}
                    currentPeriodId={currentPeriod?.id ?? null}
                    selected={selectedIds.has(item.id)}
                    onToggleSelect={toggleSelect}
                    onEdit={openDetail}
                    onDelete={requestDelete}
                    onOpenDetail={openDetail}
                    readOnly={readOnly}
                  />
                ))}
              </SortableContext>
            </DndContext>
          )}
        </div>
      </div>
    </div>
  )

  return (
    <div className="flex flex-col gap-3">
      <Card className="gap-4 px-4 py-5 sm:px-6" aria-labelledby={headingId} role="region">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex min-w-0 flex-col gap-1">
            <h2 id={headingId} className="text-[17px] font-semibold">
              {readOnly ? 'ตารางงานรายเดือน' : 'รายการงาน'}
            </h2>
            <p className="text-text-secondary text-[13px]">{description}</p>
          </div>
          {!readOnly && (
            <Button variant="outline" onClick={openCreate} className="self-start">
              <Plus className="size-4" />
              เพิ่ม item
            </Button>
          )}
        </div>

        {legend.length > 0 && (
          <ul
            aria-label="คำอธิบายสีของช่อง"
            className="text-text-secondary flex flex-wrap gap-x-4 gap-y-2 text-xs"
          >
            {legend.map(([id, s]) => (
              <li key={id} className="inline-flex items-center gap-1.5">
                <span
                  aria-hidden
                  className={cn('size-4 rounded-[5px]', !s.color && 'bg-info-subtle')}
                  style={s.color ? { backgroundColor: s.color } : undefined}
                />
                {s.name}
              </li>
            ))}
            <li className="inline-flex items-center gap-1.5">
              <span aria-hidden className="border-border size-4 rounded-[5px] border" />
              ยังไม่มี mark
            </li>
          </ul>
        )}

        {readOnly ? (
          <>
            <div className="hidden xl:block">{table}</div>
            <div className="xl:hidden">
              {items.length === 0 ? (
                <p className="text-text-secondary py-8 text-center text-sm">
                  ยังไม่มีงานในแผนนี้ — ทีมจะเพิ่มรายการเมื่อเริ่มดำเนินการ
                </p>
              ) : (
                <PlanItemCards
                  items={items}
                  periods={periods}
                  currentPeriodId={currentPeriod?.id ?? null}
                  onOpenDetail={openDetail}
                />
              )}
            </div>
          </>
        ) : (
          table
        )}
      </Card>

      <ItemEditDialog
        userId={userId}
        planId={planId}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />

      <ItemDetailSheet
        userId={userId}
        planId={planId}
        planTitle={data.title}
        item={detailItem ? (items.find((i) => i.id === detailItem.id) ?? detailItem) : null}
        onClose={() => setDetailItem(null)}
        onDelete={readOnly ? undefined : requestDelete}
        readOnly={readOnly}
      />

      <ConfirmAlert
        open={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        onConfirm={async () => {
          if (!deleteTarget) return
          await deleteMut.mutateAsync({
            userId,
            planId,
            itemId: deleteTarget.id,
          })
          if (detailItem?.id === deleteTarget.id) setDetailItem(null)
          setSelectedIds((prev) => {
            if (!prev.has(deleteTarget.id)) return prev
            const next = new Set(prev)
            next.delete(deleteTarget.id)
            return next
          })
          setDeleteTarget(null)
        }}
        title={deleteTarget ? `ลบ “${deleteTarget.activity}”` : 'ลบ item'}
        message="ลบ item นี้พร้อม marks ทุกรอบ, งานย่อย และไฟล์/ลิงก์ที่แนบไว้ — การกระทำนี้ย้อนกลับไม่ได้"
      />

      <AnimatePresence>
        {!readOnly && selectedIds.size > 0 && (
          <BulkActionToolbar
            key="bulk-toolbar"
            userId={userId}
            planId={planId}
            periods={periods}
            selectedIds={Array.from(selectedIds)}
            onClear={clearSelection}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
