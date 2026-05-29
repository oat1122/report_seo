'use client'

import { useEffect, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
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
import {
  addItemSchema,
  updateItemSchema,
  type AddItemInput,
  type UpdateItemInput,
} from '@/features/work-progress/schemas'
import { FieldError, parseFieldErrors, type FieldErrors } from '../FieldError'
import type { WorkProgressItemWithMarks } from '@/features/work-progress/domain/WorkProgressPlan'
import { useCategories, useStatuses } from '../../hooks/useMasterTables'
import { useAddItem, useUpdateItem } from '../../hooks/useItemMutations'

interface ItemEditDialogProps {
  userId: string
  planId: string
  open: boolean
  onOpenChange: (open: boolean) => void
  initial?: WorkProgressItemWithMarks | null
}

interface FormState {
  categoryId: string
  statusId: string
  activity: string
  description: string
  duration: string
  weight: number
  progressPercent: number
  note: string
  isRecurring: boolean
  recurrenceInterval: number
  recurrenceDayOfMonth: number
}

const empty: FormState = {
  categoryId: '',
  statusId: '',
  activity: '',
  description: '',
  duration: '',
  weight: 1,
  progressPercent: 0,
  note: '',
  isRecurring: false,
  recurrenceInterval: 1,
  recurrenceDayOfMonth: 1,
}

export function ItemEditDialog({
  userId,
  planId,
  open,
  onOpenChange,
  initial,
}: ItemEditDialogProps) {
  const { data: categories } = useCategories()
  const { data: statuses } = useStatuses()
  const addMut = useAddItem()
  const updateMut = useUpdateItem()

  const [form, setForm] = useState<FormState>(empty)
  const [errors, setErrors] = useState<FieldErrors>({})

  useEffect(() => {
    if (!open) return
    setErrors({})
    if (!initial) {
      setForm(empty)
      return
    }
    setForm({
      categoryId: initial.categoryId,
      statusId: initial.statusId,
      activity: initial.activity,
      description: initial.description ?? '',
      duration: initial.duration ?? '',
      weight: initial.weight,
      progressPercent: initial.progressPercent,
      note: initial.note ?? '',
      isRecurring: initial.isRecurring,
      recurrenceInterval: initial.recurrenceInterval || 1,
      recurrenceDayOfMonth: initial.recurrenceDayOfMonth ?? 1,
    })
  }, [open, initial])

  const isEdit = Boolean(initial)
  const activeCategories = (categories ?? []).filter((c) => c.isActive)
  const activeStatuses = (statuses ?? []).filter((s) => s.isActive)

  const handleSubmit = async () => {
    const newErrors: FieldErrors = {}
    if (!form.activity.trim()) newErrors.activity = 'กรุณาระบุกิจกรรม'
    if (!form.categoryId) newErrors.categoryId = 'กรุณาเลือกหมวด'
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    const recurrencePayload = form.isRecurring
      ? {
          isRecurring: true,
          recurrenceFreq: 'MONTHLY' as const,
          recurrenceInterval: form.recurrenceInterval,
          recurrenceDayOfMonth: form.recurrenceDayOfMonth,
        }
      : {
          isRecurring: false,
          recurrenceFreq: null,
          recurrenceInterval: 1,
          recurrenceDayOfMonth: null,
        }

    if (isEdit && initial) {
      const body: Record<string, unknown> = {
        categoryId: form.categoryId,
        statusId: form.statusId || undefined,
        activity: form.activity.trim(),
        description: form.description.trim() || null,
        duration: form.duration.trim() || null,
        weight: form.weight,
        progressPercent: form.progressPercent,
        note: form.note.trim() || null,
        ...recurrencePayload,
      }
      const parsed = updateItemSchema.safeParse(body)
      if (!parsed.success) {
        setErrors(parseFieldErrors(parsed.error))
        return
      }
      await updateMut.mutateAsync({
        userId,
        planId,
        itemId: initial.id,
        body: parsed.data as UpdateItemInput,
      })
    } else {
      const body: Record<string, unknown> = {
        categoryId: form.categoryId,
        statusId: form.statusId || undefined,
        activity: form.activity.trim(),
        description: form.description.trim() || null,
        duration: form.duration.trim() || null,
        weight: form.weight,
        note: form.note.trim() || null,
        ...recurrencePayload,
      }
      const parsed = addItemSchema.safeParse(body)
      if (!parsed.success) {
        setErrors(parseFieldErrors(parsed.error))
        return
      }
      await addMut.mutateAsync({
        userId,
        planId,
        body: parsed.data as AddItemInput,
      })
    }
    onOpenChange(false)
  }

  const submitting = addMut.isPending || updateMut.isPending

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'แก้ไข item' : 'เพิ่ม item'}</DialogTitle>
          <DialogDescription>กิจกรรมหนึ่งบรรทัดในแผน — เลือกหมวดและสถานะ</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          <div className="grid gap-2">
            <Label htmlFor="ie-activity">กิจกรรม</Label>
            <FieldError error={errors.activity} />
            <Input
              id="ie-activity"
              value={form.activity}
              onChange={(e) => {
                setForm((s) => ({ ...s, activity: e.target.value }))
                setErrors((prev) => ({ ...prev, activity: '' }))
              }}
              maxLength={2000}
              autoFocus={!isEdit}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>หมวด</Label>
              <FieldError error={errors.categoryId} />
              <Select
                value={form.categoryId}
                onValueChange={(v) => {
                  setForm((s) => ({ ...s, categoryId: v }))
                  setErrors((prev) => ({ ...prev, categoryId: '' }))
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="-- เลือก --" />
                </SelectTrigger>
                <SelectContent>
                  {activeCategories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>สถานะ</Label>
              <Select
                value={form.statusId}
                onValueChange={(v) => setForm((s) => ({ ...s, statusId: v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="(ใช้ค่าเริ่มต้น)" />
                </SelectTrigger>
                <SelectContent>
                  {activeStatuses.map((st) => (
                    <SelectItem key={st.id} value={st.id}>
                      {st.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="ie-desc">รายละเอียด</Label>
            <Textarea
              id="ie-desc"
              value={form.description}
              onChange={(e) => setForm((s) => ({ ...s, description: e.target.value }))}
              rows={2}
              maxLength={5000}
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="ie-duration">ระยะ</Label>
              <Input
                id="ie-duration"
                value={form.duration}
                onChange={(e) => setForm((s) => ({ ...s, duration: e.target.value }))}
                placeholder="เช่น 2 weeks"
                maxLength={100}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="ie-weight">น้ำหนัก</Label>
              <FieldError error={errors.weight} />
              <Input
                id="ie-weight"
                type="number"
                min={1}
                max={100}
                value={form.weight}
                onChange={(e) => {
                  setForm((s) => ({
                    ...s,
                    weight: Math.max(1, Number(e.target.value) || 1),
                  }))
                  setErrors((prev) => ({ ...prev, weight: '' }))
                }}
              />
            </div>
            {isEdit && (
              <div className="grid gap-2">
                <Label htmlFor="ie-pct">% ตอนนี้</Label>
                <FieldError error={errors.progressPercent} />
                <Input
                  id="ie-pct"
                  type="number"
                  min={0}
                  max={100}
                  value={form.progressPercent}
                  onChange={(e) => {
                    setForm((s) => ({
                      ...s,
                      progressPercent: Math.min(100, Math.max(0, Number(e.target.value) || 0)),
                    }))
                    setErrors((prev) => ({ ...prev, progressPercent: '' }))
                  }}
                />
              </div>
            )}
          </div>

          <div className="bg-muted/30 grid gap-3 rounded-md border p-3">
            <div className="flex items-center justify-between">
              <div className="grid gap-0.5">
                <Label htmlFor="ie-recurring" className="text-sm">
                  ทำซ้ำทุกเดือน
                </Label>
                <span className="text-muted-foreground text-xs">
                  เช่น อัพเดทบทความทุกวันที่ 14 ของทุกเดือน
                </span>
              </div>
              <Switch
                id="ie-recurring"
                checked={form.isRecurring}
                onCheckedChange={(v) => setForm((s) => ({ ...s, isRecurring: v }))}
              />
            </div>

            {form.isRecurring && (
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="ie-rec-day">วันที่ในเดือน</Label>
                  <Input
                    id="ie-rec-day"
                    type="number"
                    min={1}
                    max={31}
                    value={form.recurrenceDayOfMonth}
                    onChange={(e) =>
                      setForm((s) => ({
                        ...s,
                        recurrenceDayOfMonth: Math.min(31, Math.max(1, Number(e.target.value) || 1)),
                      }))
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="ie-rec-interval">ทุกกี่เดือน</Label>
                  <Input
                    id="ie-rec-interval"
                    type="number"
                    min={1}
                    max={12}
                    value={form.recurrenceInterval}
                    onChange={(e) =>
                      setForm((s) => ({
                        ...s,
                        recurrenceInterval: Math.min(12, Math.max(1, Number(e.target.value) || 1)),
                      }))
                    }
                  />
                </div>
              </div>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="ie-note">หมายเหตุ</Label>
            <Textarea
              id="ie-note"
              value={form.note}
              onChange={(e) => setForm((s) => ({ ...s, note: e.target.value }))}
              rows={2}
              maxLength={5000}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            ยกเลิก
          </Button>
          <Button onClick={handleSubmit} disabled={submitting}>
            {submitting ? 'กำลังบันทึก...' : 'บันทึก'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
