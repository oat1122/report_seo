'use client'

import { useEffect, useRef, useState } from 'react'
import { ListPlus, Plus, Trash2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { AnimatePresence, EASE_OUT, motion } from '@/components/motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  addTemplateItemSchema,
  updateTemplateItemSchema,
  type AddTemplateItemInput,
  type UpdateTemplateItemInput,
} from '@/features/work-progress/schemas'
import { FieldError, parseFieldErrors, type FieldErrors } from '../FieldError'
import type { WorkProgressTemplateItem } from '@/features/work-progress/domain/WorkProgressTemplate'
import { useCategories } from '../../hooks/useMasterTables'
import { useAddTemplateItem, useUpdateTemplateItem } from '../../hooks/useTemplates'

interface TemplateItemDialogProps {
  templateId: string
  /** ชื่อ template สำหรับบรรทัดคำอธิบายของ dialog */
  templateName?: string
  open: boolean
  onOpenChange: (open: boolean) => void
  initial?: WorkProgressTemplateItem | null
}

interface SubtaskDraft {
  key: number
  title: string
}

interface Form {
  categoryId: string
  activity: string
  description: string
  duration: string
  weight: number
  subtasks: SubtaskDraft[]
}

const empty: Form = {
  categoryId: '',
  activity: '',
  description: '',
  duration: '',
  weight: 1,
  subtasks: [],
}

// มือถือ = bottom sheet (Handoff rule 11) · desktop = modal กลางจอ
const SHEET_CLASS =
  'max-h-[92dvh] overflow-y-auto max-sm:top-auto max-sm:bottom-0 max-sm:left-0 max-sm:max-w-full max-sm:translate-x-0 max-sm:translate-y-0 max-sm:rounded-b-none'

const Required = () => (
  <span className="text-danger-strong" aria-hidden>
    *
  </span>
)

export function TemplateItemDialog({
  templateId,
  templateName,
  open,
  onOpenChange,
  initial,
}: TemplateItemDialogProps) {
  const { data: categories } = useCategories()
  const addMut = useAddTemplateItem()
  const updateMut = useUpdateTemplateItem()
  const [form, setForm] = useState<Form>(empty)
  const [subtaskDraft, setSubtaskDraft] = useState('')
  const [errors, setErrors] = useState<FieldErrors>({})
  const [submitError, setSubmitError] = useState<string | null>(null)
  const keySeq = useRef(0)
  const nextKey = () => ++keySeq.current

  useEffect(() => {
    if (!open) return
    setSubtaskDraft('')
    setErrors({})
    setSubmitError(null)
    if (!initial) {
      setForm(empty)
      return
    }
    setForm({
      categoryId: initial.categoryId,
      activity: initial.activity,
      description: initial.description ?? '',
      duration: initial.duration ?? '',
      weight: initial.weight,
      subtasks: (initial.subtasks ?? [])
        .slice()
        .sort((a, b) => a.orderIndex - b.orderIndex)
        .map((s) => ({ key: ++keySeq.current, title: s.title })),
    })
  }, [open, initial])

  const addSubtask = () => {
    const title = subtaskDraft.trim()
    if (!title) return
    setForm((s) => ({ ...s, subtasks: [...s.subtasks, { key: nextKey(), title }] }))
    setSubtaskDraft('')
  }

  const removeSubtask = (key: number) => {
    setForm((s) => ({
      ...s,
      subtasks: s.subtasks.filter((t) => t.key !== key),
    }))
  }

  const isEdit = Boolean(initial)
  const activeCategories = (categories ?? []).filter((c) => c.isActive)

  const handleSubmit = async () => {
    const newErrors: FieldErrors = {}
    if (!form.activity.trim()) newErrors.activity = 'กรุณาระบุกิจกรรม'
    if (!form.categoryId) newErrors.categoryId = 'กรุณาเลือกหมวด'
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    const subtasks = form.subtasks
      .map((t) => t.title.trim())
      .filter((t) => t.length > 0)
      .map((title, idx) => ({ title, orderIndex: idx }))

    const body: Record<string, unknown> = {
      categoryId: form.categoryId,
      activity: form.activity.trim(),
      description: form.description.trim() || null,
      duration: form.duration.trim() || null,
      weight: form.weight,
      subtasks,
    }

    setSubmitError(null)
    try {
      if (isEdit && initial) {
        const parsed = updateTemplateItemSchema.safeParse(body)
        if (!parsed.success) {
          setErrors(parseFieldErrors(parsed.error))
          return
        }
        await updateMut.mutateAsync({
          templateId,
          itemId: initial.id,
          body: parsed.data as UpdateTemplateItemInput,
        })
      } else {
        const parsed = addTemplateItemSchema.safeParse(body)
        if (!parsed.success) {
          setErrors(parseFieldErrors(parsed.error))
          return
        }
        await addMut.mutateAsync({
          templateId,
          body: parsed.data as AddTemplateItemInput,
        })
      }
    } catch {
      setSubmitError('บันทึก item ไม่สำเร็จ — ดูสาเหตุในข้อความแจ้งเตือน แล้วลองอีกครั้ง')
      return
    }
    onOpenChange(false)
  }

  const submitting = addMut.isPending || updateMut.isPending
  const errorId = (field: string) => (errors[field] ? `ti-${field}-error` : undefined)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="md" className={SHEET_CLASS}>
        <DialogHeader className="flex-row items-start gap-3.5 text-left">
          <span className="bg-info-subtle text-info-strong flex size-11 shrink-0 items-center justify-center rounded-[14px]">
            <ListPlus className="size-5" aria-hidden />
          </span>
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <DialogTitle>
              {isEdit ? 'แก้ไข item ใน template' : 'เพิ่ม item ใน template'}
            </DialogTitle>
            <DialogDescription>
              {templateName ? `${templateName} · ` : ''}เดือนที่ทำตั้งในตารางหลังบันทึก
            </DialogDescription>
          </div>
        </DialogHeader>

        <form
          id="ti-form"
          noValidate
          onSubmit={(e) => {
            e.preventDefault()
            void handleSubmit()
          }}
          className="flex flex-col gap-6"
        >
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="ti-act" data-required>
              กิจกรรม
            </Label>
            <Input
              id="ti-act"
              value={form.activity}
              onChange={(e) => {
                setForm((s) => ({ ...s, activity: e.target.value }))
                setErrors((prev) => ({ ...prev, activity: '' }))
              }}
              maxLength={2000}
              autoFocus={!isEdit}
              aria-required
              aria-invalid={Boolean(errors.activity)}
              aria-describedby={errorId('activity')}
            />
            <div id="ti-activity-error">
              <FieldError error={errors.activity} />
            </div>
          </div>

          <div className="grid items-start gap-4 sm:grid-cols-2">
            <div className="flex min-w-0 flex-col gap-1.5">
              <Label htmlFor="ti-cat" data-required>
                หมวด
              </Label>
              <Select
                value={form.categoryId}
                onValueChange={(v) => {
                  setForm((s) => ({ ...s, categoryId: v }))
                  setErrors((prev) => ({ ...prev, categoryId: '' }))
                }}
              >
                <SelectTrigger
                  id="ti-cat"
                  className="w-full"
                  aria-required
                  aria-invalid={Boolean(errors.categoryId)}
                  aria-describedby={errorId('categoryId')}
                >
                  <SelectValue placeholder="เลือกหมวด" />
                </SelectTrigger>
                <SelectContent>
                  {activeCategories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      <span
                        aria-hidden
                        className="border-foreground/10 size-2.5 shrink-0 rounded-[3px] border"
                        style={{ backgroundColor: c.color ?? 'var(--muted)' }}
                      />
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div id="ti-categoryId-error">
                <FieldError error={errors.categoryId} />
              </div>
            </div>
            <div className="flex min-w-0 flex-col gap-1.5">
              <Label htmlFor="ti-dur">ระยะ</Label>
              <Input
                id="ti-dur"
                value={form.duration}
                onChange={(e) => setForm((s) => ({ ...s, duration: e.target.value }))}
                maxLength={100}
                aria-invalid={Boolean(errors.duration)}
                aria-describedby={errors.duration ? 'ti-duration-error' : 'ti-dur-hint'}
              />
              {errors.duration ? (
                <div id="ti-duration-error">
                  <FieldError error={errors.duration} />
                </div>
              ) : (
                <p id="ti-dur-hint" className="text-text-secondary text-xs">
                  ข้อความแสดงในตาราง เช่น 2 สัปดาห์, ทุกเดือน
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="ti-desc">รายละเอียด</Label>
            <Textarea
              id="ti-desc"
              value={form.description}
              onChange={(e) => setForm((s) => ({ ...s, description: e.target.value }))}
              rows={2}
              maxLength={5000}
              aria-invalid={Boolean(errors.description)}
              aria-describedby={errorId('description')}
            />
            <div id="ti-description-error">
              <FieldError error={errors.description} />
            </div>
          </div>

          <section aria-labelledby="ti-subtasks" className="flex flex-col gap-2.5">
            <h3 id="ti-subtasks" className="text-[13px] font-medium">
              งานย่อย{' '}
              <span className="text-text-secondary font-normal tabular-nums">
                ({form.subtasks.length})
              </span>
            </h3>
            {form.subtasks.length > 0 && (
              <ul className="flex flex-col gap-1.5">
                <AnimatePresence initial={false}>
                  {form.subtasks.map((t) => (
                    <motion.li
                      key={t.key}
                      layout="position"
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2, ease: EASE_OUT }}
                      className="bg-muted/60 flex items-center gap-2.5 rounded-xl py-1 pr-1 pl-3"
                    >
                      <span className="min-w-0 flex-1 text-sm break-words">{t.title}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="text-text-secondary hover:text-danger-strong sm:size-9"
                        aria-label={`ลบงานย่อย ${t.title}`}
                        onClick={() => removeSubtask(t.key)}
                      >
                        <Trash2 className="size-4" aria-hidden />
                      </Button>
                    </motion.li>
                  ))}
                </AnimatePresence>
              </ul>
            )}
            <div className="flex gap-2">
              <label className="border-accent text-info-strong focus-within:ring-ring/40 flex h-11 min-w-0 flex-1 items-center gap-2 rounded-xl border border-dashed bg-white/85 px-3 focus-within:ring-2 dark:bg-white/5">
                <Plus className="size-4 shrink-0" aria-hidden />
                <span className="sr-only">เพิ่มงานย่อย</span>
                <input
                  type="text"
                  className="text-foreground placeholder:text-muted-foreground min-w-0 flex-1 bg-transparent text-sm outline-none"
                  placeholder="เพิ่มงานย่อย... (Enter เพื่อเพิ่ม)"
                  value={subtaskDraft}
                  maxLength={500}
                  onChange={(e) => setSubtaskDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      addSubtask()
                    }
                  }}
                />
              </label>
              <Button
                type="button"
                variant="soft"
                onClick={addSubtask}
                disabled={!subtaskDraft.trim()}
              >
                เพิ่ม
              </Button>
            </div>
          </section>

          {submitError && (
            <p
              role="alert"
              className="bg-danger-subtle text-danger-strong rounded-xl px-3.5 py-2.5 text-[13px]"
            >
              {submitError}
            </p>
          )}
        </form>

        <DialogFooter className="sticky bottom-0 z-[1] max-sm:pb-[max(0.875rem,env(safe-area-inset-bottom))]">
          <span className="text-text-secondary hidden text-xs sm:mr-auto sm:inline">
            <Required /> จำเป็นต้องกรอก
          </span>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            ยกเลิก
          </Button>
          <Button type="submit" form="ti-form" disabled={submitting}>
            {submitting ? 'กำลังบันทึก…' : isEdit ? 'บันทึก' : 'เพิ่ม item'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
