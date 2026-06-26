'use client'

import { useState } from 'react'
import { Plus, Trash2, Pencil, Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Field, FieldGroup } from '@/components/ui/field'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { NEXT_STEP_PRIORITIES, type NextStepPriority } from '../../domain/NextStep'
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

const EMPTY_FORM: NextStepFormData = { title: '', description: '', priority: 'MEDIUM' }

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

  const isSaving = addStep.isPending || updateStep.isPending
  const canSave = form.title.trim().length > 0 && !isSaving

  const resetForm = () => {
    setForm(EMPTY_FORM)
    setEditingId(null)
  }

  const handleSave = async () => {
    if (!canSave) return
    const payload: NextStepFormData = {
      title: form.title.trim(),
      description: form.description?.trim() || null,
      priority: form.priority,
    }
    if (editingId) {
      await updateStep.mutateAsync({ customerId, stepId: editingId, step: payload })
    } else {
      await addStep.mutateAsync({ customerId, step: payload })
    }
    resetForm()
  }

  const handleEdit = (
    id: string,
    title: string,
    description: string | null,
    priority: NextStepPriority,
  ) => {
    setEditingId(id)
    setForm({ title, description: description ?? '', priority })
  }

  return (
    <div className="border-border rounded-2xl border p-4 sm:p-6">
      <div className="mb-4">
        <h3 className="text-lg font-bold">สิ่งที่แนะนำให้ทำต่อ</h3>
        <p className="text-muted-foreground mt-1 text-sm">
          เขียน action item ที่อยากแนะนำให้ลูกค้าทำต่อ — ลูกค้าจะเห็นเป็นการ์ดบนสุดของหน้ารายงาน
        </p>
      </div>

      <div
        className={cn(
          'border-border mb-4 rounded-xl border p-4',
          editingId ? 'bg-warning/10' : 'bg-muted/50',
        )}
      >
        <FieldGroup>
          {editingId && (
            <div className="border-info/30 bg-info/10 text-info rounded-md border px-3 py-2 text-sm">
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

          <div className="flex flex-col justify-end gap-2 sm:flex-row">
            {editingId && (
              <Button variant="ghost" onClick={resetForm} disabled={isSaving}>
                ยกเลิก
              </Button>
            )}
            <Button
              onClick={handleSave}
              disabled={!canSave}
              className="bg-info text-info-foreground hover:bg-info/90"
            >
              {editingId ? <Save /> : <Plus />}
              {editingId ? 'บันทึกการแก้ไข' : 'เพิ่มรายการแนะนำ'}
            </Button>
          </div>
        </FieldGroup>
      </div>

      <div>
        <div className="mb-3 flex flex-col items-start justify-between gap-2 sm:flex-row sm:items-center">
          <h4 className="font-bold">รายการที่แนะนำ</h4>
          <Badge variant="outline" className="border-info/40 text-info">
            {steps.length} รายการ
          </Badge>
        </div>

        {steps.length === 0 ? (
          <div className="border-border text-muted-foreground rounded-xl border p-6 text-center text-sm">
            ยังไม่มีรายการแนะนำ
          </div>
        ) : (
          <ul className="flex flex-col gap-3">
            {steps.map((step) => (
              <li
                key={step.id}
                className="border-border flex items-start justify-between gap-3 rounded-xl border p-4"
              >
                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex flex-wrap items-center gap-2">
                    <span className="font-semibold break-words">{step.title}</span>
                    <Badge variant="outline" className="border-info/40 text-info">
                      {priorityLabel[step.priority]}
                    </Badge>
                  </div>
                  {step.description && (
                    <p className="text-muted-foreground text-sm break-words whitespace-pre-line">
                      {step.description}
                    </p>
                  )}
                </div>
                <div className="flex gap-0.5">
                  <Button
                    size="icon-sm"
                    variant="ghost"
                    aria-label="แก้ไข"
                    onClick={() => handleEdit(step.id, step.title, step.description, step.priority)}
                  >
                    <Pencil className="size-4" />
                  </Button>
                  <Button
                    size="icon-sm"
                    variant="ghost"
                    aria-label="ลบ"
                    onClick={() => deleteStep.mutate({ customerId, stepId: step.id })}
                    className="text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
