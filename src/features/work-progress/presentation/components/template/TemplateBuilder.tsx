'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Plus } from 'lucide-react'
import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import { SortableContext, arrayMove, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { ConfirmAlert } from '@/components/shared/ConfirmAlert'
import { toast } from 'react-toastify'
import { TemplateGridRow } from './TemplateGridRow'
import { TemplateItemDialog } from './TemplateItemDialog'
import {
  useDeleteTemplateItem,
  useReorderTemplateItems,
  useTemplate,
  useUpdateTemplate,
  useUpdateTemplateItem,
} from '../../hooks/useTemplates'
import { useCategories, useMarkTypes } from '../../hooks/useMasterTables'
import { updateTemplateSchema, type UpdateTemplateInput } from '@/features/work-progress/schemas'
import type { WorkProgressTemplateItem } from '@/features/work-progress/domain/WorkProgressTemplate'
import {
  generateTemplateMonthSlots,
  type PeriodSeed,
} from '../../../domain/policies/period-generator'
import type { TemplateDefaultPeriods } from '../../../domain/policies/template-default-periods'

interface TemplateBuilderProps {
  templateId: string
  backHref: string
}

const COL_WIDTH = {
  drag: 32,
  category: 140,
  activity: 280,
  duration: 90,
  period: 56,
  actions: 80,
} as const

export function TemplateBuilder({ templateId, backHref }: TemplateBuilderProps) {
  const { data, isLoading } = useTemplate(templateId)
  const { data: categories } = useCategories()
  const { data: markTypes } = useMarkTypes()
  const updateMut = useUpdateTemplate()
  const deleteItemMut = useDeleteTemplateItem()
  const reorderMut = useReorderTemplateItems()
  const updateItemMut = useUpdateTemplateItem()

  const [itemDialogOpen, setItemDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<WorkProgressTemplateItem | null>(null)
  const [deleteItemId, setDeleteItemId] = useState<string | null>(null)
  const [localOrder, setLocalOrder] = useState<string[] | null>(null)

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [durationMonths, setDurationMonths] = useState<number>(12)
  const [isActive, setIsActive] = useState(true)
  const [dirty, setDirty] = useState(false)

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }))

  // sync form when data loads / refetches
  useEffect(() => {
    if (data) {
      setName(data.name)
      setDescription(data.description ?? '')
      setDurationMonths(data.durationMonths)
      setIsActive(data.isActive)
      setDirty(false)
    }
  }, [data])

  const categoryById = useMemo(
    () => new Map((categories ?? []).map((c) => [c.id, c])),
    [categories],
  )

  const sortedItems = useMemo(() => {
    if (!data) return []
    const base = data.items.slice().sort((a, b) => a.orderIndex - b.orderIndex)
    if (!localOrder) return base
    const byId = new Map(base.map((i) => [i.id, i]))
    return localOrder.map((id) => byId.get(id)).filter((i): i is WorkProgressTemplateItem => !!i)
  }, [data, localOrder])

  const periodSeeds = useMemo<PeriodSeed[]>(() => {
    if (!data) return []
    return generateTemplateMonthSlots(data.durationMonths)
  }, [data])

  const activeMarkTypes = useMemo(() => (markTypes ?? []).filter((m) => m.isActive), [markTypes])

  const gridTemplate = `${COL_WIDTH.drag}px ${COL_WIDTH.category}px ${COL_WIDTH.activity}px ${COL_WIDTH.duration}px repeat(${periodSeeds.length}, ${COL_WIDTH.period}px) ${COL_WIDTH.actions}px`

  const handleChangePeriodMark = (itemId: string, nextDefaultPeriods: TemplateDefaultPeriods) => {
    updateItemMut.mutate({
      templateId,
      itemId,
      body: { defaultPeriods: nextDefaultPeriods },
    })
  }

  const handleSaveMeta = async () => {
    const body = {
      name: name.trim(),
      description: description.trim() || null,
      durationMonths,
      isActive,
    }
    const parsed = updateTemplateSchema.safeParse(body)
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? 'ข้อมูลไม่ถูกต้อง')
      return
    }
    await updateMut.mutateAsync({
      id: templateId,
      body: parsed.data as UpdateTemplateInput,
    })
    setDirty(false)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const ids = sortedItems.map((i) => i.id)
    const oldIdx = ids.indexOf(active.id as string)
    const newIdx = ids.indexOf(over.id as string)
    if (oldIdx < 0 || newIdx < 0) return
    const next = arrayMove(ids, oldIdx, newIdx)
    setLocalOrder(next)
    reorderMut.mutate(
      {
        templateId,
        body: {
          order: next.map((itemId, idx) => ({ itemId, orderIndex: idx })),
        },
      },
      { onSettled: () => setLocalOrder(null) },
    )
  }

  if (isLoading) return <Skeleton className="h-96 w-full" />
  if (!data) return null

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <Button asChild variant="ghost" size="icon">
          <Link href={backHref}>
            <ArrowLeft className="size-4" />
          </Link>
        </Button>
        <h1 className="text-xl font-semibold">{data.name}</h1>
        {data.isSystem && <span className="bg-muted rounded px-2 py-0.5 text-xs">system</span>}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">รายละเอียด template</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2">
            <div className="grid gap-1.5">
              <Label htmlFor="tb-name">ชื่อ</Label>
              <Input
                id="tb-name"
                value={name}
                onChange={(e) => {
                  setName(e.target.value)
                  setDirty(true)
                }}
                maxLength={200}
                disabled={data.isSystem}
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="tb-duration">จำนวนเดือน</Label>
              <Select
                value={String(durationMonths)}
                onValueChange={(v) => {
                  setDurationMonths(Number(v))
                  setDirty(true)
                }}
                disabled={data.isSystem}
              >
                <SelectTrigger id="tb-duration">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[3, 6, 9, 12, 18, 24, 36, 48, 60].map((n) => (
                    <SelectItem key={n} value={String(n)}>
                      {n} เดือน
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-1.5">
              <Label>สถานะ</Label>
              <div className="border-input flex h-9 items-center gap-2 rounded-md border px-3">
                <Switch
                  checked={isActive}
                  onCheckedChange={(v) => {
                    setIsActive(v)
                    setDirty(true)
                  }}
                  disabled={data.isSystem}
                />
                <span className="text-sm">{isActive ? 'เปิดใช้' : 'ปิด'}</span>
              </div>
            </div>
            <div className="grid gap-1.5 md:col-span-2">
              <Label htmlFor="tb-desc">รายละเอียด</Label>
              <Textarea
                id="tb-desc"
                value={description}
                onChange={(e) => {
                  setDescription(e.target.value)
                  setDirty(true)
                }}
                rows={2}
                maxLength={5000}
                disabled={data.isSystem}
              />
            </div>
          </div>
          {dirty && !data.isSystem && (
            <div className="mt-3 flex justify-end">
              <Button size="sm" onClick={handleSaveMeta} disabled={updateMut.isPending}>
                บันทึก
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-sm">รายการกิจกรรม</CardTitle>
          {!data.isSystem && (
            <Button
              size="sm"
              onClick={() => {
                setEditingItem(null)
                setItemDialogOpen(true)
              }}
            >
              <Plus className="size-4" />
              เพิ่ม item
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {sortedItems.length === 0 ? (
            <p className="text-muted-foreground py-6 text-center text-sm">ยังไม่มี item</p>
          ) : (
            <div className="border-border overflow-x-auto rounded-md border">
              <div className="min-w-fit">
                <div
                  className="border-border bg-muted text-muted-foreground grid border-b text-xs font-medium"
                  style={{ gridTemplateColumns: gridTemplate }}
                  role="row"
                >
                  <div className="border-border border-r" />
                  <div className="border-border border-r px-2 py-2">หมวด</div>
                  <div className="border-border border-r px-2 py-2">กิจกรรม</div>
                  <div className="border-border border-r px-2 py-2">ระยะ</div>
                  {periodSeeds.map((p) => (
                    <div key={p.seq} className="border-border border-r px-1 py-2 text-center">
                      {p.label}
                    </div>
                  ))}
                  <div />
                </div>
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={sortedItems.map((i) => i.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    {sortedItems.map((i) => (
                      <TemplateGridRow
                        key={i.id}
                        item={i}
                        category={categoryById.get(i.categoryId)}
                        periodSeqs={periodSeeds.map((p) => p.seq)}
                        markTypes={activeMarkTypes}
                        gridTemplate={gridTemplate}
                        disabled={data.isSystem}
                        onEdit={() => {
                          setEditingItem(i)
                          setItemDialogOpen(true)
                        }}
                        onDelete={() => setDeleteItemId(i.id)}
                        onChangePeriodMark={handleChangePeriodMark}
                      />
                    ))}
                  </SortableContext>
                </DndContext>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <TemplateItemDialog
        templateId={templateId}
        open={itemDialogOpen}
        onOpenChange={setItemDialogOpen}
        initial={editingItem}
      />

      <ConfirmAlert
        open={deleteItemId !== null}
        onClose={() => setDeleteItemId(null)}
        onConfirm={async () => {
          if (!deleteItemId) return
          await deleteItemMut.mutateAsync({
            templateId,
            itemId: deleteItemId,
          })
          setDeleteItemId(null)
        }}
        title="ลบ item ใน template"
        message="ลบ item นี้ออกจาก template — แผนที่สร้างไปแล้วจะไม่ถูกกระทบ"
      />
    </div>
  )
}
