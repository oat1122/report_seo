'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { Plus, Trash2, Pencil, Save, X, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Field, FieldGroup } from '@/components/ui/field'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { NEXT_STEP_PRIORITIES, type NextStep, type NextStepPriority } from '../../domain/NextStep'
import { MAX_NEXT_STEP_IMAGES } from '../../schemas'
import {
  useGetNextSteps,
  useAddNextStep,
  useUpdateNextStep,
  useDeleteNextStep,
  type NextStepFormData,
} from '../hooks/useNextSteps'

const priorityLabel: Record<NextStepPriority, string> = {
  HIGH: 'สำคัญมาก',
  MEDIUM: 'ปานกลาง',
  LOW: 'ทั่วไป',
}

// คู่สีสถานะของ UI Kit (พื้น + ตัวอักษร)
const priorityPill: Record<NextStepPriority, string> = {
  HIGH: 'bg-danger-subtle text-danger-strong',
  MEDIUM: 'bg-warning-subtle text-warning-text',
  LOW: 'bg-info-subtle text-foreground',
}

const EMPTY_FORM: NextStepFormData = { title: '', description: '', priority: 'MEDIUM' }
const ACCEPT = 'image/png,image/jpeg'

interface NextStepsManagerProps {
  customerId: string
}

export function NextStepsManager({ customerId }: NextStepsManagerProps) {
  const { data: steps = [] } = useGetNextSteps(customerId)
  const addStep = useAddNextStep()
  const updateStep = useUpdateNextStep()
  const deleteStep = useDeleteNextStep()

  const [form, setForm] = useState<NextStepFormData>(EMPTY_FORM)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [files, setFiles] = useState<File[]>([])
  const [imagesToDelete, setImagesToDelete] = useState<string[]>([])
  const [pendingDelete, setPendingDelete] = useState<NextStep | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const editingStep = editingId ? steps.find((s) => s.id === editingId) : undefined
  const keptImages = (editingStep?.images ?? []).filter((img) => !imagesToDelete.includes(img.id))

  // preview ของไฟล์ใหม่ที่เพิ่งเลือก — revoke เมื่อ files เปลี่ยน/unmount กัน memory leak
  const previews = useMemo(() => files.map((f) => URL.createObjectURL(f)), [files])
  useEffect(() => () => previews.forEach((url) => URL.revokeObjectURL(url)), [previews])

  const totalImages = keptImages.length + files.length
  const overLimit = totalImages > MAX_NEXT_STEP_IMAGES
  const isSaving = addStep.isPending || updateStep.isPending
  const canSave = form.title.trim().length > 0 && !overLimit && !isSaving

  const resetForm = () => {
    setForm(EMPTY_FORM)
    setEditingId(null)
    setFiles([])
    setImagesToDelete([])
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleSave = async () => {
    if (!canSave) return
    const payload: NextStepFormData = {
      title: form.title.trim(),
      description: form.description?.trim() || null,
      priority: form.priority,
    }
    if (editingId) {
      await updateStep.mutateAsync({
        customerId,
        stepId: editingId,
        step: payload,
        files,
        imagesToDelete,
      })
    } else {
      await addStep.mutateAsync({ customerId, step: payload, files })
    }
    resetForm()
  }

  const handleEdit = (id: string) => {
    const step = steps.find((s) => s.id === id)
    if (!step) return
    setEditingId(id)
    setForm({ title: step.title, description: step.description ?? '', priority: step.priority })
    setFiles([])
    setImagesToDelete([])
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const confirmDelete = () => {
    if (!pendingDelete) return
    deleteStep.mutate(
      { customerId, stepId: pendingDelete.id },
      { onSettled: () => setPendingDelete(null) },
    )
  }

  return (
    <div className="bg-glass-card border-glass-border shadow-card rounded-[20px] border p-4 backdrop-blur-[14px] sm:p-6">
      <div className="mb-4 flex flex-col gap-1">
        <h3 className="text-[17px] leading-snug font-semibold">สิ่งที่แนะนำให้ทำต่อ</h3>
        <p className="text-text-secondary text-[13px]">
          เขียน action item ที่อยากแนะนำให้ลูกค้าทำต่อ — ลูกค้าจะเห็นเป็นการ์ดในหน้า Overview
          ของรายงาน และบนหน้าหลักของลูกค้า (3 รายการแรก)
        </p>
      </div>

      <div
        className={cn(
          'border-glass-border mb-5 rounded-2xl border p-4',
          editingId ? 'bg-warning-subtle' : 'bg-glass-tile',
        )}
      >
        <FieldGroup>
          {editingId && (
            <div className="bg-info-subtle text-foreground rounded-xl px-3 py-2 text-sm">
              กำลังแก้ไขรายการเดิม ปรับข้อมูลแล้วกดบันทึกการแก้ไขได้ทันที
            </div>
          )}

          <Field>
            <Label htmlFor="ns-title">หัวข้อ</Label>
            <Input
              id="ns-title"
              placeholder="เช่น เพิ่มบทความ 4 ชิ้นในเดือนนี้"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            />
          </Field>

          <Field>
            <Label htmlFor="ns-priority">ความสำคัญ</Label>
            <Select
              value={form.priority}
              onValueChange={(v) => setForm((f) => ({ ...f, priority: v as NextStepPriority }))}
            >
              <SelectTrigger id="ns-priority" className="sm:w-56">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {NEXT_STEP_PRIORITIES.map((p) => (
                  <SelectItem key={p} value={p}>
                    {priorityLabel[p]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <Field>
            <Label htmlFor="ns-description">รายละเอียด</Label>
            <Textarea
              id="ns-description"
              placeholder="อธิบายสิ่งที่แนะนำให้ทำ พร้อมเหตุผลสั้น ๆ"
              value={form.description ?? ''}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              rows={3}
            />
          </Field>

          <Field>
            <Label htmlFor="ns-images">
              รูปภาพประกอบ (ไม่บังคับ • สูงสุด {MAX_NEXT_STEP_IMAGES} รูป)
            </Label>

            {(keptImages.length > 0 || files.length > 0) && (
              <div className="mb-2 flex flex-wrap gap-2">
                {keptImages.map((img) => (
                  <ThumbWithRemove
                    key={img.id}
                    src={img.imageUrl}
                    onRemove={() => setImagesToDelete((ids) => [...ids, img.id])}
                  />
                ))}
                {previews.map((url, idx) => (
                  <ThumbWithRemove
                    key={url}
                    src={url}
                    onRemove={() => setFiles((fs) => fs.filter((_, i) => i !== idx))}
                  />
                ))}
              </div>
            )}

            <Input
              id="ns-images"
              ref={fileInputRef}
              type="file"
              accept={ACCEPT}
              multiple
              aria-invalid={overLimit || undefined}
              aria-describedby={overLimit ? 'ns-images-error' : undefined}
              onChange={(e) => setFiles(Array.from(e.target.files ?? []))}
            />
            {overLimit && (
              <p id="ns-images-error" className="text-danger-strong text-xs">
                เลือกได้ไม่เกิน {MAX_NEXT_STEP_IMAGES} รูป (ตอนนี้ {totalImages} รูป) —
                ลบรูปที่ไม่ใช้ออกก่อนบันทึก
              </p>
            )}
          </Field>

          <div className="flex flex-col-reverse justify-end gap-2 sm:flex-row">
            {editingId && (
              <Button variant="outline" onClick={resetForm} disabled={isSaving}>
                ยกเลิก
              </Button>
            )}
            <Button onClick={handleSave} disabled={!canSave}>
              {isSaving ? (
                <Loader2 aria-hidden className="animate-spin" />
              ) : editingId ? (
                <Save aria-hidden />
              ) : (
                <Plus aria-hidden />
              )}
              {editingId ? 'บันทึกการแก้ไข' : 'เพิ่มรายการแนะนำ'}
            </Button>
          </div>
        </FieldGroup>
      </div>

      <div>
        <div className="mb-3 flex items-center justify-between gap-2">
          <h4 className="text-[15px] font-semibold">รายการที่แนะนำ</h4>
          <span className="bg-muted text-text-secondary inline-flex h-6 items-center rounded-full px-2.5 text-xs font-semibold tabular-nums">
            {steps.length} รายการ
          </span>
        </div>

        {steps.length === 0 ? (
          <div className="bg-glass-tile text-text-secondary rounded-2xl p-6 text-center text-sm">
            ยังไม่มีรายการแนะนำ — เพิ่มรายการแรกจากฟอร์มด้านบน
          </div>
        ) : (
          <ul className="flex flex-col gap-2">
            {steps.map((step) => (
              <li
                key={step.id}
                className="bg-glass-tile border-glass-border flex items-start justify-between gap-3 rounded-2xl border p-4"
              >
                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex flex-wrap items-center gap-2">
                    <span className="font-semibold break-words">{step.title}</span>
                    <span
                      className={cn(
                        'inline-flex h-6 items-center rounded-full px-2.5 text-xs font-semibold',
                        priorityPill[step.priority],
                      )}
                    >
                      {priorityLabel[step.priority]}
                    </span>
                  </div>
                  {step.description && (
                    <p className="text-text-secondary text-sm break-words whitespace-pre-line">
                      {step.description}
                    </p>
                  )}
                  {step.images.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {step.images.map((img, idx) => (
                        <a
                          key={img.id}
                          href={img.imageUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`เปิดรูปที่ ${idx + 1} ของ ${step.title} ในแท็บใหม่`}
                          className="border-glass-border block size-16 overflow-hidden rounded-xl border"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={img.imageUrl}
                            alt={step.title}
                            className="size-full object-cover"
                          />
                        </a>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex gap-0.5">
                  <Button
                    size="icon-sm"
                    variant="ghost"
                    aria-label={`แก้ไข ${step.title}`}
                    onClick={() => handleEdit(step.id)}
                    className="size-11 md:size-9"
                  >
                    <Pencil className="size-4" />
                  </Button>
                  <Button
                    size="icon-sm"
                    variant="ghost"
                    aria-label={`ลบ ${step.title}`}
                    onClick={() => setPendingDelete(step)}
                    className="text-danger-strong hover:bg-danger-subtle size-11 md:size-9"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <AlertDialog open={!!pendingDelete} onOpenChange={(o) => !o && setPendingDelete(null)}>
        <AlertDialogContent className="flex flex-col gap-[18px] p-6 sm:max-w-[480px] sm:p-[26px]">
          <span
            aria-hidden
            className="bg-danger-subtle text-danger-strong flex size-12 items-center justify-center rounded-2xl"
          >
            <Trash2 className="size-6" />
          </span>
          <div className="flex flex-col gap-1.5 text-left">
            <AlertDialogTitle className="text-xl leading-snug font-semibold">
              ลบรายการแนะนำนี้?
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="text-text-secondary text-sm leading-relaxed">
                <p className="text-foreground font-medium break-words">“{pendingDelete?.title}”</p>
                <ul className="mt-2 list-disc pl-5">
                  <li>ลูกค้าจะไม่เห็นรายการนี้ในรายงานและหน้าหลักอีก</li>
                  {(pendingDelete?.images.length ?? 0) > 0 && (
                    <li>รูปประกอบ {pendingDelete?.images.length} รูปจะถูกลบไปด้วย</li>
                  )}
                  <li>ย้อนกลับไม่ได้</li>
                </ul>
              </div>
            </AlertDialogDescription>
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            <AlertDialogCancel disabled={deleteStep.isPending}>ยกเลิก</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault()
                confirmDelete()
              }}
              disabled={deleteStep.isPending}
              className="bg-destructive hover:bg-danger-strong text-destructive-foreground"
            >
              {deleteStep.isPending && <Loader2 aria-hidden className="animate-spin" />}
              ลบรายการ
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

function ThumbWithRemove({ src, onRemove }: { src: string; onRemove: () => void }) {
  return (
    <div className="border-glass-border relative size-16 overflow-hidden rounded-xl border">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt="" className="size-full object-cover" />
      <button
        type="button"
        aria-label="ลบรูป"
        onClick={onRemove}
        className="bg-foreground/60 text-background hover:bg-destructive absolute top-0.5 right-0.5 flex size-6 items-center justify-center rounded-full"
      >
        <X className="size-3.5" />
      </button>
    </div>
  )
}
