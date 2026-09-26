'use client'

import { useEffect, useMemo, useState, type CSSProperties } from 'react'
import Link from 'next/link'
import { ChevronLeft, ListPlus, Plus } from 'lucide-react'
import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import { SortableContext, arrayMove, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { Reveal } from '@/components/motion'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
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
import { cn } from '@/lib/utils'
import { TemplateGridRow } from './TemplateGridRow'
import { TemplateItemDialog } from './TemplateItemDialog'
import { markSwatchStyle } from './TemplatePeriodCell'
import { FieldError, parseFieldErrors, type FieldErrors } from '../FieldError'
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

// ความกว้างคอลัมน์ของกริดตั้งแต่ @3xl (px) — ตาม Admin-TemplateBuilder: ลาก 44 · ระยะ 110 · เดือน 36 · ตัวเลือก 64
const COL_WIDTH = {
  drag: 44,
  activityMin: 220,
  duration: 110,
  period: 36,
  actions: 64,
} as const

const DURATION_OPTIONS = [3, 6, 9, 12, 18, 24, 36, 48, 60]

const sectionClass =
  'border-glass-border bg-glass-card shadow-card @container flex min-w-0 flex-col gap-4 rounded-[20px] border p-4 backdrop-blur-md sm:px-6 sm:py-[22px]'

export function TemplateBuilder({ templateId, backHref }: TemplateBuilderProps) {
  const { data, isLoading, isError, refetch } = useTemplate(templateId)
  const { data: categories } = useCategories()
  const { data: markTypes } = useMarkTypes()
  const updateMut = useUpdateTemplate()
  const deleteItemMut = useDeleteTemplateItem()
  const reorderMut = useReorderTemplateItems()
  const updateItemMut = useUpdateTemplateItem()

  const [itemDialogOpen, setItemDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<WorkProgressTemplateItem | null>(null)
  const [deleteItem, setDeleteItem] = useState<WorkProgressTemplateItem | null>(null)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [localOrder, setLocalOrder] = useState<string[] | null>(null)

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [durationMonths, setDurationMonths] = useState<number>(12)
  const [isActive, setIsActive] = useState(true)
  const [dirty, setDirty] = useState(false)
  const [metaErrors, setMetaErrors] = useState<FieldErrors>({})

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }))

  // sync form when data loads / refetches
  useEffect(() => {
    if (data) {
      setName(data.name)
      setDescription(data.description ?? '')
      setDurationMonths(data.durationMonths)
      setIsActive(data.isActive)
      setDirty(false)
      setMetaErrors({})
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

  const gridVars = {
    '--tpl-cols': `${COL_WIDTH.drag}px minmax(${COL_WIDTH.activityMin}px,1fr) ${COL_WIDTH.duration}px repeat(${periodSeeds.length}, ${COL_WIDTH.period}px) ${COL_WIDTH.actions}px`,
    '--tpl-min': `${
      COL_WIDTH.drag +
      COL_WIDTH.activityMin +
      COL_WIDTH.duration +
      periodSeeds.length * COL_WIDTH.period +
      COL_WIDTH.actions
    }px`,
  } as CSSProperties

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
      const next = parseFieldErrors(parsed.error)
      if (!body.name) next.name = 'กรุณาระบุชื่อ template'
      setMetaErrors(next)
      return
    }
    setMetaErrors({})
    try {
      await updateMut.mutateAsync({
        id: templateId,
        body: parsed.data as UpdateTemplateInput,
      })
    } catch {
      // ข้อความ error แสดงผ่าน toast ของ axios interceptor แล้ว — คงค่าที่แก้ไว้ให้ลองใหม่ได้
      return
    }
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

  const openCreateItem = () => {
    setEditingItem(null)
    setItemDialogOpen(true)
  }

  const backLink = (
    <Link
      href={backHref}
      className="text-text-secondary hover:text-foreground focus-visible:ring-ring/60 inline-flex min-h-11 items-center gap-1 self-start rounded-lg text-[13px] outline-none focus-visible:ring-2 md:min-h-7"
    >
      <ChevronLeft className="size-4" aria-hidden />
      Templates
    </Link>
  )

  if (isLoading) {
    return (
      <div className="flex flex-col gap-5" role="status">
        <span className="sr-only">กำลังโหลด template</span>
        <Skeleton className="h-16 w-full max-w-md rounded-2xl" />
        <Skeleton className="h-56 w-full rounded-[20px]" />
        <Skeleton className="h-96 w-full rounded-[20px]" />
      </div>
    )
  }

  if (isError || !data) {
    return (
      <div className="flex flex-col gap-5">
        {backLink}
        <div
          role="alert"
          className="border-glass-border bg-glass-card shadow-card flex flex-col items-start gap-3 rounded-[20px] border p-6"
        >
          <div className="flex flex-col gap-1">
            <h1 className="text-xl font-semibold">
              {isError ? 'โหลด template ไม่สำเร็จ' : 'ไม่พบ template นี้'}
            </h1>
            <p className="text-text-secondary text-[13px]">
              {isError
                ? 'ตรวจสอบการเชื่อมต่ออินเทอร์เน็ต แล้วกด “ลองอีกครั้ง”'
                : 'template อาจถูกลบไปแล้ว — กลับไปเลือกจากรายการ Templates'}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {isError && (
              <Button variant="outline" onClick={() => void refetch()}>
                ลองอีกครั้ง
              </Button>
            )}
            <Button asChild variant="soft">
              <Link href={backHref}>กลับไปรายการ Templates</Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const readOnly = data.isSystem

  return (
    <div className="flex min-w-0 flex-col gap-5">
      <header className="flex min-w-0 flex-col gap-1.5">
        {backLink}
        <h1 className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[26px] leading-tight font-semibold break-words md:text-[28px]">
          {data.name}
          {data.isSystem && <Badge variant="default">system</Badge>}
        </h1>
        <p className="text-text-secondary text-sm">
          {readOnly
            ? 'System template — ดูได้อย่างเดียว แก้ไขรายละเอียดและรายการกิจกรรมไม่ได้'
            : 'แก้ไขรายละเอียดและรายการกิจกรรมของ template'}
        </p>
      </header>

      <Reveal>
        <section aria-labelledby="tb-info" className={sectionClass}>
          <h2 id="tb-info" className="text-[17px] font-semibold">
            รายละเอียด template
          </h2>
          <form
            noValidate
            onSubmit={(e) => {
              e.preventDefault()
              if (dirty && !readOnly) void handleSaveMeta()
            }}
            className="flex flex-col gap-4"
          >
            <div className="grid items-start gap-4 @2xl:grid-cols-2 @4xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)]">
              <div className="flex min-w-0 flex-col gap-1.5 @2xl:col-span-2 @4xl:col-span-1">
                <Label htmlFor="tb-name" data-required>
                  ชื่อ
                </Label>
                <Input
                  id="tb-name"
                  aria-required
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value)
                    setDirty(true)
                    setMetaErrors((prev) => ({ ...prev, name: '' }))
                  }}
                  maxLength={200}
                  disabled={readOnly}
                  aria-invalid={Boolean(metaErrors.name)}
                  aria-describedby={metaErrors.name ? 'tb-name-error' : undefined}
                />
                <div id="tb-name-error">
                  <FieldError error={metaErrors.name} />
                </div>
              </div>
              <div className="flex min-w-0 flex-col gap-1.5">
                <Label htmlFor="tb-duration">จำนวนเดือน</Label>
                <Select
                  value={String(durationMonths)}
                  onValueChange={(v) => {
                    setDurationMonths(Number(v))
                    setDirty(true)
                  }}
                  disabled={readOnly}
                >
                  <SelectTrigger id="tb-duration" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DURATION_OPTIONS.map((n) => (
                      <SelectItem key={n} value={String(n)}>
                        {n} เดือน
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div id="tb-duration-error">
                  <FieldError error={metaErrors.durationMonths} />
                </div>
              </div>
              <div className="flex min-w-0 flex-col gap-1.5">
                <span id="tb-active-label" className="text-[13px] font-medium">
                  สถานะ
                </span>
                <label
                  htmlFor="tb-active"
                  className="flex min-h-11 cursor-pointer items-center gap-3 text-sm font-medium has-disabled:cursor-not-allowed"
                >
                  <Switch
                    id="tb-active"
                    checked={isActive}
                    onCheckedChange={(v) => {
                      setIsActive(v)
                      setDirty(true)
                    }}
                    disabled={readOnly}
                    aria-describedby="tb-active-label"
                  />
                  {isActive ? 'เปิดใช้' : 'ปิด'}
                </label>
              </div>
            </div>

            <div className="grid items-end gap-4 @2xl:grid-cols-[minmax(0,1fr)_auto]">
              <div className="flex min-w-0 flex-col gap-1.5">
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
                  disabled={readOnly}
                  aria-invalid={Boolean(metaErrors.description)}
                  aria-describedby={metaErrors.description ? 'tb-desc-error' : undefined}
                />
                <div id="tb-desc-error">
                  <FieldError error={metaErrors.description} />
                </div>
              </div>
              {!readOnly && (
                <div className="flex flex-col items-stretch gap-1.5 @2xl:items-end">
                  {dirty && (
                    <span className="text-text-secondary text-xs" aria-live="polite">
                      มีการแก้ไขที่ยังไม่บันทึก
                    </span>
                  )}
                  <Button type="submit" disabled={!dirty || updateMut.isPending}>
                    {updateMut.isPending ? 'กำลังบันทึก…' : 'บันทึก'}
                  </Button>
                </div>
              )}
            </div>
          </form>
        </section>
      </Reveal>

      <Reveal delay={0.06}>
        <section aria-labelledby="tb-items" className={sectionClass}>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="flex min-w-0 flex-1 flex-col gap-1">
              <h2 id="tb-items" className="text-[17px] font-semibold">
                รายการกิจกรรม
              </h2>
              <p className="text-text-secondary text-[13px]">
                <span className="tabular-nums">{sortedItems.length}</span> items
                {readOnly
                  ? ' · ช่องเดือนแสดง mark ที่วางแผนไว้'
                  : ' · ลากที่ไอคอนจับเพื่อจัดลำดับ · กดช่องเดือนเพื่อกำหนด mark'}
              </p>
            </div>
            {!readOnly && (
              <Button variant="soft" onClick={openCreateItem} className="sm:h-10">
                <Plus className="size-4" aria-hidden />
                เพิ่ม item
              </Button>
            )}
          </div>

          {activeMarkTypes.length > 0 && sortedItems.length > 0 && (
            <ul
              aria-label="คำอธิบายสัญลักษณ์ในช่องเดือน"
              className="text-text-secondary flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs"
            >
              {activeMarkTypes.map((m) => (
                <li key={m.id} className="inline-flex items-center gap-1.5">
                  <span
                    aria-hidden
                    className={cn(
                      'inline-block size-3.5 rounded-[4px] border-2 border-dashed',
                      !m.color && 'border-info bg-info-subtle/60',
                    )}
                    style={markSwatchStyle(m.color)}
                  />
                  {m.name}
                </li>
              ))}
              <li className="inline-flex items-center gap-1.5">
                <span
                  aria-hidden
                  className="bg-muted-foreground/40 inline-block size-1 rounded-full"
                />
                ยังไม่กำหนด
              </li>
            </ul>
          )}

          {sortedItems.length === 0 ? (
            <div className="border-border flex flex-col items-center gap-3 rounded-2xl border border-dashed px-6 py-10 text-center">
              <span className="bg-info-subtle text-info-strong flex size-11 items-center justify-center rounded-[14px]">
                <ListPlus className="size-5" aria-hidden />
              </span>
              <div className="flex flex-col gap-1">
                <p className="text-sm font-medium">ยังไม่มี item ใน template นี้</p>
                <p className="text-text-secondary text-[13px]">
                  {readOnly
                    ? 'system template นี้ยังไม่มีกิจกรรม'
                    : 'เพิ่มกิจกรรมแรก แล้วกำหนดเดือนที่ทำในตาราง'}
                </p>
              </div>
              {!readOnly && (
                <Button variant="soft" onClick={openCreateItem}>
                  <Plus className="size-4" aria-hidden />
                  เพิ่ม item
                </Button>
              )}
            </div>
          ) : (
            <div className="@3xl:border-border/80 @3xl:bg-glass-tile @3xl:overflow-x-auto @3xl:rounded-2xl @3xl:border">
              <div
                role="table"
                aria-label="รายการกิจกรรมใน template"
                style={gridVars}
                className="flex flex-col gap-2 @3xl:[min-width:var(--tpl-min)] @3xl:gap-0"
              >
                <div
                  role="row"
                  className="border-border text-text-secondary hidden border-b text-xs font-medium @3xl:grid @3xl:[grid-template-columns:var(--tpl-cols)]"
                >
                  <div role="columnheader" className="px-2 py-3">
                    <span className="sr-only">ลากเพื่อเรียง</span>
                  </div>
                  <div role="columnheader" className="px-3.5 py-3">
                    กิจกรรม
                  </div>
                  <div role="columnheader" className="px-3.5 py-3">
                    ระยะ
                  </div>
                  {periodSeeds.map((p) => (
                    <div
                      key={p.seq}
                      role="columnheader"
                      className="py-3 text-center tabular-nums"
                      title={p.label}
                    >
                      <span aria-hidden>ม.{p.seq}</span>
                      <span className="sr-only">{p.label}</span>
                    </div>
                  ))}
                  <div role="columnheader" className="py-3">
                    <span className="sr-only">ตัวเลือก</span>
                  </div>
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
                        periods={periodSeeds}
                        markTypes={activeMarkTypes}
                        disabled={readOnly}
                        onEdit={() => {
                          setEditingItem(i)
                          setItemDialogOpen(true)
                        }}
                        onDelete={() => {
                          setDeleteItem(i)
                          setDeleteOpen(true)
                        }}
                        onChangePeriodMark={handleChangePeriodMark}
                      />
                    ))}
                  </SortableContext>
                </DndContext>
              </div>
            </div>
          )}
        </section>
      </Reveal>

      <TemplateItemDialog
        templateId={templateId}
        templateName={data.name}
        open={itemDialogOpen}
        onOpenChange={setItemDialogOpen}
        initial={editingItem}
      />

      <ConfirmAlert
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={() => {
          if (!deleteItem) return
          const itemId = deleteItem.id
          setDeleteOpen(false)
          deleteItemMut.mutateAsync({ templateId, itemId }).catch(() => {
            // ข้อความ error แสดงผ่าน toast ของ axios interceptor แล้ว
          })
        }}
        title={`ลบ “${deleteItem?.activity ?? ''}” ออกจาก template`}
        message="item นี้และงานย่อยทั้งหมดจะถูกลบออกจาก template และเดือนที่กำหนดไว้จะหายไปด้วย · แผนของลูกค้าที่สร้างไปแล้วจะไม่ถูกกระทบ"
      />
    </div>
  )
}
