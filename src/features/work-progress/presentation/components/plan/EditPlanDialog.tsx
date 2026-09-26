'use client'

import { useEffect, useMemo, useState } from 'react'
import { Pencil } from 'lucide-react'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { updatePlanSchema, type UpdatePlanInput } from '@/features/work-progress/schemas'
import { FieldError, parseFieldErrors, type FieldErrors } from '../FieldError'
import type { WorkProgressPlan } from '@/features/work-progress/domain/WorkProgressPlan'
import { useUpdatePlan } from '../../hooks/useWorkProgressPlans'
import { THAI_MONTHS } from './planDisplay'

function countMonths(sm: number, sy: number, em: number, ey: number): number {
  return (ey - sy) * 12 + (em - sm) + 1
}

interface EditPlanDialogProps {
  userId: string
  plan: WorkProgressPlan
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EditPlanDialog({ userId, plan, open, onOpenChange }: EditPlanDialogProps) {
  const updateMut = useUpdatePlan()

  const currentYear = new Date().getFullYear()

  const [title, setTitle] = useState('')
  const [startMonth, setStartMonth] = useState<number>(1)
  const [startYear, setStartYear] = useState<number>(currentYear)
  const [endMonth, setEndMonth] = useState<number>(1)
  const [endYear, setEndYear] = useState<number>(currentYear)
  const [packageName, setPackageName] = useState('')
  const [note, setNote] = useState('')
  const [errors, setErrors] = useState<FieldErrors>({})

  const hasDateRange = plan.startDate !== null && plan.endDate !== null

  useEffect(() => {
    if (!open) return
    setTitle(plan.title)
    setPackageName(plan.packageName ?? '')
    setNote(plan.note ?? '')
    setErrors({})

    if (plan.startDate) {
      const sd = new Date(plan.startDate)
      setStartMonth(sd.getMonth() + 1)
      setStartYear(sd.getFullYear())
    }
    if (plan.endDate) {
      const ed = new Date(plan.endDate)
      setEndMonth(ed.getMonth() + 1)
      setEndYear(ed.getFullYear())
    }
  }, [open, plan])

  const yearOptions = useMemo(() => {
    const base = currentYear
    return Array.from({ length: 11 }, (_, i) => base - 2 + i)
  }, [currentYear])

  const monthCount = useMemo(() => {
    const c = countMonths(startMonth, startYear, endMonth, endYear)
    return c > 0 ? c : null
  }, [startMonth, startYear, endMonth, endYear])

  const rangeInvalid = useMemo(
    () => countMonths(startMonth, startYear, endMonth, endYear) <= 0,
    [startMonth, startYear, endMonth, endYear],
  )

  const handleSubmit = async () => {
    const newErrors: FieldErrors = {}
    if (hasDateRange && rangeInvalid) {
      newErrors.endMonth = 'เดือนจบต้องไม่อยู่ก่อนเดือนเริ่ม'
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    const body: Record<string, unknown> = {
      title: title.trim(),
      packageName: packageName.trim() || null,
      note: note.trim() || null,
    }

    if (hasDateRange) {
      body.startMonth = startMonth
      body.startYear = startYear
      body.endMonth = endMonth
      body.endYear = endYear
    }

    const parsed = updatePlanSchema.safeParse(body)
    if (!parsed.success) {
      setErrors(parseFieldErrors(parsed.error))
      return
    }

    await updateMut.mutateAsync({
      userId,
      planId: plan.id,
      body: parsed.data as UpdatePlanInput,
    })
    onOpenChange(false)
  }

  const monthSelect = (
    id: string,
    label: string,
    value: number,
    onChange: (v: number) => void,
    options: readonly (string | number)[],
    toValue: (opt: string | number, i: number) => number,
  ) => (
    <div className="grid gap-1.5">
      <Label htmlFor={id} className="text-[13px]">
        {label}
      </Label>
      <Select value={String(value)} onValueChange={(v) => onChange(Number(v))}>
        <SelectTrigger
          id={id}
          className="w-full"
          aria-invalid={rangeInvalid && id.startsWith('ep-e') ? true : undefined}
          aria-describedby="ep-range-hint"
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((opt, i) => (
            <SelectItem key={String(opt)} value={String(toValue(opt, i))}>
              {opt}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="md" className="max-h-[92dvh] overflow-y-auto">
        <DialogHeader className="flex-row items-start gap-3.5 text-left">
          <span
            aria-hidden
            className="bg-info-subtle text-info-strong flex size-11 shrink-0 items-center justify-center rounded-[14px]"
          >
            <Pencil className="size-5" />
          </span>
          <div className="flex min-w-0 flex-col gap-1">
            <DialogTitle className="text-xl font-semibold">แก้ไขแผนงาน</DialogTitle>
            <DialogDescription className="text-text-secondary truncate text-[13px]">
              {plan.title}
            </DialogDescription>
          </div>
        </DialogHeader>

        <div className="grid gap-5">
          <div className="grid gap-1.5">
            <Label htmlFor="ep-title" className="text-[13px]">
              ชื่อแผน{' '}
              <span className="text-danger-strong" aria-hidden>
                *
              </span>
            </Label>
            <Input
              id="ep-title"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value)
                setErrors((prev) => ({ ...prev, title: '' }))
              }}
              placeholder="เช่น SEO Plan 2026"
              maxLength={200}
              autoFocus
              aria-required
              aria-invalid={errors.title ? true : undefined}
              aria-describedby={errors.title ? 'ep-title-err' : undefined}
            />
            <FieldError error={errors.title} id="ep-title-err" />
          </div>

          {hasDateRange && (
            <div className="grid gap-2">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {monthSelect(
                  'ep-sm',
                  'เริ่มเดือน',
                  startMonth,
                  setStartMonth,
                  THAI_MONTHS,
                  (_, i) => i + 1,
                )}
                {monthSelect('ep-sy', 'ปี', startYear, setStartYear, yearOptions, (y) => Number(y))}
                {monthSelect(
                  'ep-em',
                  'ถึงเดือน',
                  endMonth,
                  setEndMonth,
                  THAI_MONTHS,
                  (_, i) => i + 1,
                )}
                {monthSelect('ep-ey', 'ปี', endYear, setEndYear, yearOptions, (y) => Number(y))}
              </div>
              <p id="ep-range-hint" className="text-xs">
                {rangeInvalid || errors.endMonth ? (
                  <span className="text-danger-strong">
                    {errors.endMonth || 'เดือนจบต้องไม่อยู่ก่อนเดือนเริ่ม'}
                  </span>
                ) : (
                  <span className="text-text-secondary">
                    {THAI_MONTHS[startMonth - 1]} {startYear} → {THAI_MONTHS[endMonth - 1]}{' '}
                    {endYear}
                    {monthCount !== null && <span className="ml-1">({monthCount} เดือน)</span>}
                  </span>
                )}
              </p>
            </div>
          )}

          <div className="grid gap-1.5">
            <Label htmlFor="ep-pkg" className="text-[13px]">
              Package (ไม่บังคับ)
            </Label>
            <Input
              id="ep-pkg"
              value={packageName}
              onChange={(e) => setPackageName(e.target.value)}
              maxLength={200}
            />
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="ep-note" className="text-[13px]">
              หมายเหตุ
            </Label>
            <Textarea
              id="ep-note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
              maxLength={5000}
            />
          </div>
        </div>

        <DialogFooter className="sticky bottom-0 z-10">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            ยกเลิก
          </Button>
          <Button onClick={handleSubmit} disabled={updateMut.isPending}>
            {updateMut.isPending ? 'กำลังบันทึก...' : 'บันทึก'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
