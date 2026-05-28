'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  Dialog,
  DialogContent,
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

const THAI_MONTHS = [
  'ม.ค.',
  'ก.พ.',
  'มี.ค.',
  'เม.ย.',
  'พ.ค.',
  'มิ.ย.',
  'ก.ค.',
  'ส.ค.',
  'ก.ย.',
  'ต.ค.',
  'พ.ย.',
  'ธ.ค.',
] as const

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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>แก้ไขแผนงาน</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="ep-title">ชื่อแผน</Label>
            <FieldError error={errors.title} />
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
            />
          </div>

          {hasDateRange && (
            <div className="border-border bg-muted/30 grid gap-3 rounded-md border p-3">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div className="grid gap-1.5">
                  <Label className="text-xs">เริ่มเดือน</Label>
                  <Select
                    value={String(startMonth)}
                    onValueChange={(v) => setStartMonth(Number(v))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {THAI_MONTHS.map((m, i) => (
                        <SelectItem key={i} value={String(i + 1)}>
                          {m}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-1.5">
                  <Label className="text-xs">เริ่มปี</Label>
                  <Select value={String(startYear)} onValueChange={(v) => setStartYear(Number(v))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {yearOptions.map((y) => (
                        <SelectItem key={y} value={String(y)}>
                          {y}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-1.5">
                  <Label className="text-xs">ถึงเดือน</Label>
                  <Select value={String(endMonth)} onValueChange={(v) => setEndMonth(Number(v))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {THAI_MONTHS.map((m, i) => (
                        <SelectItem key={i} value={String(i + 1)}>
                          {m}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-1.5">
                  <Label className="text-xs">ถึงปี</Label>
                  <Select value={String(endYear)} onValueChange={(v) => setEndYear(Number(v))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {yearOptions.map((y) => (
                        <SelectItem key={y} value={String(y)}>
                          {y}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <FieldError error={errors.endMonth} />
              <div className="text-muted-foreground text-xs">
                {rangeInvalid ? (
                  <span className="text-destructive">เดือนจบต้องไม่อยู่ก่อนเดือนเริ่ม</span>
                ) : (
                  <>
                    {THAI_MONTHS[startMonth - 1]} {startYear} → {THAI_MONTHS[endMonth - 1]}{' '}
                    {endYear}
                    {monthCount !== null && <span className="ml-1">({monthCount} เดือน)</span>}
                  </>
                )}
              </div>
            </div>
          )}

          <div className="grid gap-2">
            <Label htmlFor="ep-pkg">Package (optional)</Label>
            <Input
              id="ep-pkg"
              value={packageName}
              onChange={(e) => setPackageName(e.target.value)}
              maxLength={200}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="ep-note">หมายเหตุ</Label>
            <Textarea
              id="ep-note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
              maxLength={5000}
            />
          </div>
        </div>

        <DialogFooter>
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
