'use client'

import { useState } from 'react'
import { Repeat, Trash2 } from 'lucide-react'
import { FadeSwap } from '@/components/motion'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { SubtaskList } from './SubtaskList'
import { AttachmentGallery } from './AttachmentGallery'
import { AssignItemPopover } from './AssignItemPopover'
import { ItemFormFields } from './ItemFormFields'
import { itemFormFrom, useSubmitItemForm, type ItemFormState } from './itemForm'
import { StatusChip } from '../plan/StatusChip'
import type { FieldErrors } from '../FieldError'
import { getEffectiveItemPercent } from '../../../domain/policies/progress-calculator'
import type { WorkProgressItemWithMarks } from '@/features/work-progress'

interface ItemDetailSheetProps {
  userId: string
  planId: string
  // ชื่อแผน — แสดงเป็นบรรทัดบนของหัว sheet
  planTitle?: string
  item: WorkProgressItemWithMarks | null
  onClose: () => void
  // ลบ item (ผ่าน ConfirmAlert ของ PlanGrid) — ไม่ส่ง = ไม่มีปุ่มลบ
  onDelete?: (item: WorkProgressItemWithMarks) => void
  readOnly?: boolean
}

// sheet ขวา 560px: ฟอร์มแก้ไข item + ผู้รับผิดชอบ + งานย่อย + ไฟล์ · footer ติดล่าง
export function ItemDetailSheet({
  userId,
  planId,
  planTitle,
  item,
  onClose,
  onDelete,
  readOnly,
}: ItemDetailSheetProps) {
  return (
    <Sheet open={item !== null} onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="w-full sm:w-[560px]">
        {item && (
          // key = item.id → เปลี่ยน item แล้วฟอร์มเริ่มใหม่ แต่ refetch ของ item เดิมไม่ล้างสิ่งที่พิมพ์ค้าง
          <ItemSheetBody
            key={item.id}
            userId={userId}
            planId={planId}
            planTitle={planTitle}
            item={item}
            onClose={onClose}
            onDelete={onDelete}
            readOnly={readOnly}
          />
        )}
      </SheetContent>
    </Sheet>
  )
}

function ItemSheetBody({
  userId,
  planId,
  planTitle,
  item,
  onClose,
  onDelete,
  readOnly,
}: Omit<ItemDetailSheetProps, 'item'> & { item: WorkProgressItemWithMarks }) {
  const { submit, submitting } = useSubmitItemForm(userId, planId)
  const [form, setForm] = useState<ItemFormState>(() => itemFormFrom(item))
  const [errors, setErrors] = useState<FieldErrors>({})

  const effectivePercent = getEffectiveItemPercent({
    status: { isTerminal: item.status.isTerminal },
    subtasks: item.subtasks,
  })
  const doneCount = item.subtasks.filter((s) => s.isDone).length

  const handleSave = async () => {
    const result = await submit(form, item)
    if (result) {
      setErrors(result)
      return
    }
    onClose()
  }

  const sectionTitle = 'text-[15px] font-semibold'

  return (
    <>
      <SheetHeader className="gap-1.5 pr-16">
        {planTitle && <p className="text-text-secondary truncate text-xs">{planTitle}</p>}
        <SheetTitle className="flex items-center gap-2 text-xl">
          <span className="line-clamp-2">{readOnly ? item.activity : 'แก้ไข item'}</span>
          {readOnly && item.isRecurring && (
            <Repeat className="text-info-strong size-4 shrink-0" aria-label="งานทำซ้ำรายเดือน" />
          )}
        </SheetTitle>
        <SheetDescription asChild>
          <div className="text-text-secondary flex flex-wrap items-center gap-2 pt-1 text-xs">
            <span className="bg-muted inline-flex items-center gap-1.5 rounded-[6px] px-2 py-0.5">
              <span
                aria-hidden
                className="bg-muted-foreground size-2 rounded-[3px]"
                style={item.category.color ? { backgroundColor: item.category.color } : undefined}
              />
              {item.category.name}
            </span>
            <StatusChip name={item.status.name} color={item.status.color} />
            <span className="tabular-nums">ความคืบหน้า {effectivePercent}%</span>
            {item.duration && <span>· {item.duration}</span>}
          </div>
        </SheetDescription>
      </SheetHeader>

      <div className="flex-1 overflow-y-auto">
        <FadeSwap className="flex flex-col gap-7 px-6 py-5">
          {readOnly ? (
            (item.description || item.note) && (
              <section className="flex flex-col gap-2 text-sm leading-relaxed">
                {item.description && <p className="whitespace-pre-line">{item.description}</p>}
                {item.note && (
                  <p className="text-text-secondary whitespace-pre-line">หมายเหตุ: {item.note}</p>
                )}
              </section>
            )
          ) : (
            <ItemFormFields
              form={form}
              onChange={(patch) => setForm((s) => ({ ...s, ...patch }))}
              errors={errors}
              onClearError={(key) => setErrors((prev) => ({ ...prev, [key]: '' }))}
              isEdit
              idPrefix={`is-${item.id}`}
            />
          )}

          <section aria-labelledby={`is-assignee-${item.id}`} className="flex flex-col gap-3">
            <h3 id={`is-assignee-${item.id}`} className={sectionTitle}>
              ผู้รับผิดชอบ
            </h3>
            <AssignItemPopover
              userId={userId}
              planId={planId}
              itemId={item.id}
              currentAssigneeId={item.assignedToId}
              currentAssigneeName={item.assignedTo?.name ?? null}
              readOnly={readOnly}
            />
          </section>

          <section aria-labelledby={`is-subtasks-${item.id}`} className="flex flex-col gap-3">
            <div className="flex items-baseline justify-between gap-2">
              <h3 id={`is-subtasks-${item.id}`} className={sectionTitle}>
                งานย่อย
              </h3>
              {item.subtasks.length > 0 && (
                <span className="text-text-secondary text-xs tabular-nums">
                  {doneCount} / {item.subtasks.length} เสร็จ
                </span>
              )}
            </div>
            <SubtaskList
              userId={userId}
              planId={planId}
              itemId={item.id}
              subtasks={item.subtasks}
              readOnly={readOnly}
            />
          </section>

          <section aria-labelledby={`is-files-${item.id}`} className="flex flex-col gap-3">
            <h3 id={`is-files-${item.id}`} className={sectionTitle}>
              ไฟล์ / ลิงก์
            </h3>
            <AttachmentGallery
              userId={userId}
              planId={planId}
              itemId={item.id}
              attachments={item.attachments}
              readOnly={readOnly}
            />
          </section>
        </FadeSwap>
      </div>

      <SheetFooter className="sm:items-center sm:justify-between">
        {readOnly ? (
          <Button variant="outline" onClick={onClose} className="sm:ml-auto">
            ปิด
          </Button>
        ) : (
          <>
            {onDelete ? (
              <Button
                variant="ghost"
                className="text-danger-strong hover:text-danger-strong hover:bg-danger-subtle"
                onClick={() => onDelete(item)}
              >
                <Trash2 className="size-4" />
                ลบ item
              </Button>
            ) : (
              <span />
            )}
            <div className="flex flex-col-reverse gap-2 sm:flex-row">
              <Button variant="outline" onClick={onClose}>
                ยกเลิก
              </Button>
              <Button onClick={handleSave} disabled={submitting}>
                {submitting ? 'กำลังบันทึก...' : 'บันทึก'}
              </Button>
            </div>
          </>
        )}
      </SheetFooter>
    </>
  )
}
