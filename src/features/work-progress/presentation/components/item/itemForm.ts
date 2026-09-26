'use client'

// state + การส่งฟอร์ม item — ใช้ร่วมกันระหว่าง ItemEditDialog (เพิ่ม) และ ItemDetailSheet (แก้ไข)
import {
  addItemSchema,
  updateItemSchema,
  type AddItemInput,
  type UpdateItemInput,
} from '@/features/work-progress/schemas'
import type { WorkProgressItemWithMarks } from '@/features/work-progress/domain/WorkProgressPlan'
import { parseFieldErrors, type FieldErrors } from '../FieldError'
import { useAddItem, useUpdateItem } from '../../hooks/useItemMutations'

export interface ItemFormState {
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

export const EMPTY_ITEM_FORM: ItemFormState = {
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

export function itemFormFrom(initial: WorkProgressItemWithMarks): ItemFormState {
  return {
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
  }
}

// ตรวจ + ส่งฟอร์ม · คืน FieldErrors เมื่อไม่ผ่าน, null เมื่อบันทึกสำเร็จ
export function useSubmitItemForm(userId: string, planId: string) {
  const addMut = useAddItem()
  const updateMut = useUpdateItem()

  const submit = async (
    form: ItemFormState,
    initial: WorkProgressItemWithMarks | null | undefined,
  ): Promise<FieldErrors | null> => {
    const newErrors: FieldErrors = {}
    if (!form.activity.trim()) newErrors.activity = 'กรุณาระบุกิจกรรม'
    if (!form.categoryId) newErrors.categoryId = 'กรุณาเลือกหมวด'
    if (Object.keys(newErrors).length > 0) return newErrors

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

    if (initial) {
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
      if (!parsed.success) return parseFieldErrors(parsed.error)
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
      if (!parsed.success) return parseFieldErrors(parsed.error)
      await addMut.mutateAsync({
        userId,
        planId,
        body: parsed.data as AddItemInput,
      })
    }
    return null
  }

  return { submit, submitting: addMut.isPending || updateMut.isPending }
}
