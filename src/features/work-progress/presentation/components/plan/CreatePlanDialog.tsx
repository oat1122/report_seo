'use client'

import { useEffect, useMemo, useState } from 'react'
import { Plus, X } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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
import { Skeleton } from '@/components/ui/skeleton'
import { createPlanSchema, type CreatePlanInput } from '@/features/work-progress/schemas'
import { FieldError, parseFieldErrors, type FieldErrors } from '../FieldError'
import type { WorkProgressTemplate } from '@/features/work-progress/domain/WorkProgressTemplate'
import type { WorkProgressPlan } from '@/features/work-progress/domain/WorkProgressPlan'
import { useCreatePlan, useWorkProgressPlans } from '../../hooks/useWorkProgressPlans'
import { useTemplates } from '../../hooks/useTemplates'

type SourceTab = 'empty' | 'template' | 'clone'
type RangeMode = 'monthly' | 'legacy'

const PERIOD_OPTIONS = [
  { value: 'YEAR_12_MONTHS', label: '12 เดือน (รายเดือน)' },
  { value: 'YEAR_4_QUARTERS', label: '4 ไตรมาส' },
  { value: 'HALF_2_PERIODS', label: 'ครึ่งปี (2 ช่วง)' },
  { value: 'CUSTOM', label: 'กำหนดเอง' },
] as const

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

interface CreatePlanDialogProps {
  userId: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreated?: (plan: WorkProgressPlan) => void
}

export function CreatePlanDialog({ userId, open, onOpenChange, onCreated }: CreatePlanDialogProps) {
  const createMut = useCreatePlan()
  const { data: templates, isLoading: templatesLoading } = useTemplates({
    enabled: open,
  })
  const { data: existingPlans, isLoading: plansLoading } = useWorkProgressPlans(userId, {
    enabled: open,
  })

  const currentYear = new Date().getFullYear()
  const currentMonth = new Date().getMonth() + 1

  const [tab, setTab] = useState<SourceTab>('empty')
  const [rangeMode, setRangeMode] = useState<RangeMode>('monthly')
  const [title, setTitle] = useState('')
  const [startMonth, setStartMonth] = useState<number>(currentMonth)
  const [startYear, setStartYear] = useState<number>(currentYear)
  const [endMonth, setEndMonth] = useState<number>(currentMonth)
  const [endYear, setEndYear] = useState<number>(currentYear)
  const [year, setYear] = useState<string>(String(currentYear))
  const [periodType, setPeriodType] =
    useState<(typeof PERIOD_OPTIONS)[number]['value']>('YEAR_12_MONTHS')
  const [packageName, setPackageName] = useState('')
  const [note, setNote] = useState('')
  const [templateId, setTemplateId] = useState<string>('')
  const [cloneFromPlanId, setCloneFromPlanId] = useState<string>('')
  const [customPeriods, setCustomPeriods] = useState<string[]>([''])
  const [errors, setErrors] = useState<FieldErrors>({})

  useEffect(() => {
    if (!open) return
    setTab('empty')
    setRangeMode('monthly')
    setTitle('')
    setStartMonth(currentMonth)
    setStartYear(currentYear)
    setEndMonth(currentMonth)
    setEndYear(currentYear + 1)
    setYear(String(currentYear))
    setPeriodType('YEAR_12_MONTHS')
    setPackageName('')
    setNote('')
    setTemplateId('')
    setCloneFromPlanId('')
    setCustomPeriods([''])
    setErrors({})
  }, [open, currentMonth, currentYear])

  const activeTemplates = useMemo(
    () => (templates ?? []).filter((t: WorkProgressTemplate) => t.isActive),
    [templates],
  )

  const yearOptions = useMemo(() => {
    const base = currentYear
    return Array.from({ length: 11 }, (_, i) => base - 2 + i)
  }, [currentYear])

  const monthCount = useMemo(() => {
    if (rangeMode !== 'monthly') return null
    const c = countMonths(startMonth, startYear, endMonth, endYear)
    return c > 0 ? c : null
  }, [rangeMode, startMonth, startYear, endMonth, endYear])

  const rangeInvalid = useMemo(() => {
    if (rangeMode !== 'monthly') return false
    return countMonths(startMonth, startYear, endMonth, endYear) <= 0
  }, [rangeMode, startMonth, startYear, endMonth, endYear])

  const handleSubmit = async () => {
    const newErrors: FieldErrors = {}
    const body: Record<string, unknown> = {
      title: title.trim(),
      packageName: packageName.trim() || null,
      note: note.trim() || null,
    }

    if (rangeMode === 'monthly') {
      if (rangeInvalid) {
        newErrors.endMonth = 'เดือนจบต้องไม่อยู่ก่อนเดือนเริ่ม'
      }
      body.periodType = 'YEAR_12_MONTHS'
      body.startMonth = startMonth
      body.startYear = startYear
      body.endMonth = endMonth
      body.endYear = endYear
    } else {
      body.periodType = periodType
      const yearNum = Number(year)
      if (year && !Number.isNaN(yearNum)) body.year = yearNum
      if (periodType === 'CUSTOM') {
        const labels = customPeriods.map((s) => s.trim()).filter(Boolean)
        if (labels.length === 0) {
          newErrors.customPeriods = 'กรุณาระบุ period อย่างน้อย 1 ช่วง'
        }
        body.customPeriods = labels.map((label) => ({ label }))
      }
    }

    if (tab === 'template') {
      if (!templateId) newErrors.templateId = 'กรุณาเลือก template'
      body.templateId = templateId
    } else if (tab === 'clone') {
      if (!cloneFromPlanId) newErrors.cloneFromPlanId = 'กรุณาเลือกแผนต้นทาง'
      body.cloneFromPlanId = cloneFromPlanId
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    const parsed = createPlanSchema.safeParse(body)
    if (!parsed.success) {
      setErrors(parseFieldErrors(parsed.error))
      return
    }

    const plan = await createMut.mutateAsync({
      userId,
      body: parsed.data as CreatePlanInput,
    })
    onCreated?.(plan)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>สร้างแผนงาน</DialogTitle>
          <DialogDescription>
            เลือกวิธีเริ่ม — จากศูนย์ · ใช้ template · clone จากแผนเดิม
          </DialogDescription>
        </DialogHeader>

        <Tabs value={tab} onValueChange={(v) => setTab(v as SourceTab)}>
          <TabsList>
            <TabsTrigger value="empty">จากศูนย์</TabsTrigger>
            <TabsTrigger value="template">ใช้ template</TabsTrigger>
            <TabsTrigger value="clone">Clone</TabsTrigger>
          </TabsList>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="cp-title">ชื่อแผน</Label>
              <FieldError error={errors.title} />
              <Input
                id="cp-title"
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

            <div className="flex items-center gap-2 text-xs">
              <button
                type="button"
                onClick={() => setRangeMode('monthly')}
                className={`rounded-md px-2.5 py-1 transition ${
                  rangeMode === 'monthly'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-muted/70'
                }`}
              >
                ช่วงเดือน (ข้ามปีได้)
              </button>
              <button
                type="button"
                onClick={() => setRangeMode('legacy')}
                className={`rounded-md px-2.5 py-1 transition ${
                  rangeMode === 'legacy'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-muted/70'
                }`}
              >
                ไตรมาส / ครึ่งปี / กำหนดเอง
              </button>
            </div>

            {rangeMode === 'monthly' ? (
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
                    <Select
                      value={String(startYear)}
                      onValueChange={(v) => setStartYear(Number(v))}
                    >
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
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>รูปแบบ period</Label>
                  <Select
                    value={periodType}
                    onValueChange={(v) => setPeriodType(v as typeof periodType)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PERIOD_OPTIONS.map((o) => (
                        <SelectItem key={o.value} value={o.value}>
                          {o.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="cp-year">ปี (optional)</Label>
                  <Input
                    id="cp-year"
                    type="number"
                    min={2020}
                    max={2099}
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                  />
                </div>
              </div>
            )}

            {rangeMode === 'legacy' && periodType === 'CUSTOM' && (
              <div className="grid gap-2">
                <Label>Period labels</Label>
                <FieldError error={errors.customPeriods} />
                <div className="flex flex-col gap-2">
                  {customPeriods.map((label, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <Input
                        value={label}
                        onChange={(e) =>
                          setCustomPeriods((prev) => {
                            const next = [...prev]
                            next[i] = e.target.value
                            return next
                          })
                        }
                        placeholder={`Period ${i + 1}`}
                        maxLength={50}
                      />
                      {customPeriods.length > 1 && (
                        <Button
                          type="button"
                          size="icon"
                          variant="ghost"
                          onClick={() =>
                            setCustomPeriods((prev) => prev.filter((_, idx) => idx !== i))
                          }
                          aria-label="ลบ period"
                        >
                          <X className="size-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setCustomPeriods((prev) => [...prev, ''])}
                    className="self-start"
                  >
                    <Plus className="size-4" />
                    เพิ่ม period
                  </Button>
                </div>
              </div>
            )}

            <div className="grid gap-2">
              <Label htmlFor="cp-pkg">Package (optional)</Label>
              <Input
                id="cp-pkg"
                value={packageName}
                onChange={(e) => setPackageName(e.target.value)}
                maxLength={200}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="cp-note">หมายเหตุ</Label>
              <Textarea
                id="cp-note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={2}
                maxLength={5000}
              />
            </div>

            <TabsContent value="empty" className="m-0 p-0">
              <p className="text-muted-foreground text-xs">
                สร้างแผนเปล่า — จะเพิ่ม item เองในขั้นถัดไป
              </p>
            </TabsContent>

            <TabsContent value="template" className="m-0 p-0">
              <div className="grid gap-2">
                <Label>เลือก Template</Label>
                <FieldError error={errors.templateId} />
                {templatesLoading ? (
                  <Skeleton className="h-9 w-full" />
                ) : (
                  <Select value={templateId} onValueChange={setTemplateId}>
                    <SelectTrigger>
                      <SelectValue placeholder="-- เลือก template --" />
                    </SelectTrigger>
                    <SelectContent>
                      {activeTemplates.length === 0 ? (
                        <div className="text-muted-foreground px-3 py-2 text-sm">
                          ยังไม่มี template
                        </div>
                      ) : (
                        activeTemplates.map((t) => (
                          <SelectItem key={t.id} value={t.id}>
                            {t.name}
                            <span className="text-muted-foreground ml-2 text-xs">
                              ({t.durationMonths} เดือน)
                            </span>
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                )}
              </div>
            </TabsContent>

            <TabsContent value="clone" className="m-0 p-0">
              <div className="grid gap-2">
                <Label>Clone จากแผน</Label>
                <FieldError error={errors.cloneFromPlanId} />
                {plansLoading ? (
                  <Skeleton className="h-9 w-full" />
                ) : (
                  <Select value={cloneFromPlanId} onValueChange={setCloneFromPlanId}>
                    <SelectTrigger>
                      <SelectValue placeholder="-- เลือกแผน --" />
                    </SelectTrigger>
                    <SelectContent>
                      {(existingPlans ?? []).length === 0 ? (
                        <div className="text-muted-foreground px-3 py-2 text-sm">
                          ยังไม่มีแผนให้ clone
                        </div>
                      ) : (
                        (existingPlans ?? []).map((p) => (
                          <SelectItem key={p.id} value={p.id}>
                            {p.title}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                )}
              </div>
            </TabsContent>
          </div>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            ยกเลิก
          </Button>
          <Button onClick={handleSubmit} disabled={createMut.isPending}>
            {createMut.isPending ? 'กำลังสร้าง...' : 'สร้าง'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
