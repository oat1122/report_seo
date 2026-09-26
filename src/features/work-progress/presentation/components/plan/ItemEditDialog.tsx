'use client'

import { useEffect, useState } from 'react'
import { ListPlus, Pencil } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import type { FieldErrors } from '../FieldError'
import type { WorkProgressItemWithMarks } from '@/features/work-progress/domain/WorkProgressPlan'
import { ItemFormFields } from '../item/ItemFormFields'
import {
  EMPTY_ITEM_FORM,
  itemFormFrom,
  useSubmitItemForm,
  type ItemFormState,
} from '../item/itemForm'

interface ItemEditDialogProps {
  userId: string
  planId: string
  open: boolean
  onOpenChange: (open: boolean) => void
  initial?: WorkProgressItemWithMarks | null
}

export function ItemEditDialog({
  userId,
  planId,
  open,
  onOpenChange,
  initial,
}: ItemEditDialogProps) {
  const { submit, submitting } = useSubmitItemForm(userId, planId)

  const [form, setForm] = useState<ItemFormState>(EMPTY_ITEM_FORM)
  const [errors, setErrors] = useState<FieldErrors>({})

  useEffect(() => {
    if (!open) return
    setErrors({})
    setForm(initial ? itemFormFrom(initial) : EMPTY_ITEM_FORM)
  }, [open, initial])

  const isEdit = Boolean(initial)

  const handleSubmit = async () => {
    const result = await submit(form, initial)
    if (result) {
      setErrors(result)
      return
    }
    onOpenChange(false)
  }

  const Icon = isEdit ? Pencil : ListPlus

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="md" className="max-h-[92dvh] overflow-y-auto">
        <DialogHeader className="flex-row items-start gap-3.5 text-left">
          <span
            aria-hidden
            className="bg-info-subtle text-info-strong flex size-11 shrink-0 items-center justify-center rounded-[14px]"
          >
            <Icon className="size-5" />
          </span>
          <div className="flex min-w-0 flex-col gap-1">
            <DialogTitle className="text-xl font-semibold">
              {isEdit ? 'แก้ไข item' : 'เพิ่ม item'}
            </DialogTitle>
            <DialogDescription className="text-text-secondary text-[13px]">
              กิจกรรมหนึ่งบรรทัดในแผน — เลือกหมวดและสถานะ
            </DialogDescription>
          </div>
        </DialogHeader>

        <ItemFormFields
          form={form}
          onChange={(patch) => setForm((s) => ({ ...s, ...patch }))}
          errors={errors}
          onClearError={(key) => setErrors((prev) => ({ ...prev, [key]: '' }))}
          isEdit={isEdit}
          idPrefix="ie"
        />

        <DialogFooter className="sticky bottom-0 z-10 sm:justify-between">
          <span className="text-text-secondary hidden text-xs sm:inline">
            <span className="text-danger-strong">*</span> จำเป็นต้องกรอก
          </span>
          <div className="flex flex-col-reverse gap-2.5 sm:flex-row">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              ยกเลิก
            </Button>
            <Button onClick={handleSubmit} disabled={submitting}>
              {submitting ? 'กำลังบันทึก...' : 'บันทึก'}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
