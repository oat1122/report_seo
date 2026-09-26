'use client'

import { useEffect, useMemo, useState } from 'react'
import { CheckCircle2, ClipboardPlus, LayoutTemplate, Plus, X } from 'lucide-react'
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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { createPlanSchema, type CreatePlanInput } from '@/features/work-progress/schemas'
import { FieldError, parseFieldErrors, type FieldErrors } from '../FieldError'
import type { WorkProgressTemplate } from '@/features/work-progress/domain/WorkProgressTemplate'
import type { WorkProgressPlan } from '@/features/work-progress/domain/WorkProgressPlan'
import { useCreatePlan, useWorkProgressPlans } from '../../hooks/useWorkProgressPlans'
import { useTemplate, useTemplates } from '../../hooks/useTemplates'
import { THAI_MONTHS } from './planDisplay'

export type PlanSourceTab = 'empty' | 'template' | 'clone'
type RangeMode = 'monthly' | 'legacy'

const PERIOD_OPTIONS = [
  { value: 'YEAR_12_MONTHS', label: '12 เดือน (รายเดือน)' },
  { value: 'YEAR_4_QUARTERS', label: '4 ไตรมาส' },
  { value: 'HALF_2_PERIODS', label: 'ครึ่งปี (2 ช่วง)' },
  { value: 'CUSTOM', label: 'กำหนดเอง' },
] as const

function countMonths(sm: number, sy: number, em: number, ey: number): number {
  return (ey - sy) * 12 + (em - sm) + 1
}

interface CreatePlanDialogProps {
  userId: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreated?: (plan: WorkProgressPlan) => void
  // แท็บเริ่มต้นเมื่อเปิด (มาจากปุ่ม "เริ่มแผนใหม่" แต่ละแบบ)
  initialTab?: PlanSourceTab
}

function Required() {
  return (
    <span className="text-danger-strong" aria-hidden>
      *
    </span>
  )
}

export function CreatePlanDialog({
  userId,
  open,
  onOpenChange,
  onCreated,
  initialTab = 'empty',
}: CreatePlanDialogProps) {
  const createMut = useCreatePlan()
  const { data: templates, isLoading: templatesLoading } = useTemplates({
    enabled: open,
  })
  const { data: existingPlans, isLoading: plansLoading } = useWorkProgressPlans(userId, {
    enabled: open,
  })

  const currentYear = new Date().getFullYear()
  const currentMonth = new Date().getMonth() + 1

  const [tab, setTab] = useState<PlanSourceTab>(initialTab)
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

  // จำนวน item ของ template ที่เลือก — ใช้ในแถบสรุปก่อนสร้าง
  const { data: templateDetail } = useTemplate(tab === 'template' && templateId ? templateId : null)

  useEffect(() => {
    if (!open) return
    setTab(initialTab)
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
  }, [open, currentMonth, currentYear, initialTab])

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

  // แถบสรุปก่อนสร้าง
  const sourceText =
    tab === 'template'
      ? templateId
        ? `จาก template “${activeTemplates.find((t) => t.id === templateId)?.name ?? ''}”${templateDetail ? ` · ${templateDetail.items.length} items` : ''}`
        : null
      : tab === 'clone'
        ? cloneFromPlanId
          ? `คัดลอกจาก “${(existingPlans ?? []).find((p) => p.id === cloneFromPlanId)?.title ?? ''}”`
          : null
        : 'แผนเปล่า'
  const rangeText =
    rangeMode === 'monthly'
      ? monthCount !== null
        ? `${monthCount} เดือน (${THAI_MONTHS[startMonth - 1]} ${startYear} – ${THAI_MONTHS[endMonth - 1]} ${endYear})`
        : null
      : `${PERIOD_OPTIONS.find((o) => o.value === periodType)?.label ?? ''}${year ? ` · ปี ${year}` : ''}`

  const selectedTrigger = 'w-full'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="lg" className="max-h-[92dvh] overflow-y-auto">
        <DialogHeader className="flex-row items-start gap-3.5 text-left">
          <span
            aria-hidden
            className="bg-info-subtle text-info-strong flex size-11 shrink-0 items-center justify-center rounded-[14px]"
          >
            <ClipboardPlus className="size-5" />
          </span>
          <div className="flex min-w-0 flex-col gap-1">
            <DialogTitle className="text-xl font-semibold">สร้างแผนงาน</DialogTitle>
            <DialogDescription className="text-text-secondary text-[13px]">
              เลือกวิธีเริ่ม — จากศูนย์ · ใช้ template · clone จากแผนเดิม
            </DialogDescription>
          </div>
        </DialogHeader>

        <Tabs value={tab} onValueChange={(v) => setTab(v as PlanSourceTab)} className="gap-5">
          <TabsList variant="line" className="w-full justify-start">
            <TabsTrigger value="empty">จากศูนย์</TabsTrigger>
            <TabsTrigger value="template">ใช้ template</TabsTrigger>
            <TabsTrigger value="clone">Clone จากแผนเดิม</TabsTrigger>
          </TabsList>

          <TabsContent value="empty" className="m-0 p-0">
            <p className="text-text-secondary text-[13px]">
              สร้างแผนเปล่า — จะเพิ่ม item เองในขั้นถัดไป
            </p>
          </TabsContent>

          <TabsContent value="template" className="m-0 p-0">
            <div className="grid gap-2.5">
              <span id="cp-template-label" className="text-[13px] font-medium">
                เลือก Template <Required />
              </span>
              {templatesLoading ? (
                <div className="grid gap-2.5 sm:grid-cols-3">
                  {Array.from({ length: 3 }, (_, i) => (
                    <Skeleton key={i} className="h-16 rounded-[14px]" />
                  ))}
                </div>
              ) : activeTemplates.length === 0 ? (
                <p className="text-text-secondary border-border rounded-[14px] border border-dashed px-4 py-6 text-center text-[13px]">
                  ยังไม่มี template ที่เปิดใช้ — สร้างได้ที่หน้าตั้งค่า Work Progress
                </p>
              ) : (
                <RadioGroup
                  value={templateId}
                  onValueChange={(v) => {
                    setTemplateId(v)
                    setErrors((prev) => ({ ...prev, templateId: '' }))
                  }}
                  aria-labelledby="cp-template-label"
                  aria-invalid={errors.templateId ? true : undefined}
                  aria-describedby={errors.templateId ? 'cp-template-err' : undefined}
                  className="grid gap-2.5 sm:grid-cols-3"
                >
                  {activeTemplates.map((t) => (
                    <Label
                      key={t.id}
                      htmlFor={`cp-tpl-${t.id}`}
                      className={cn(
                        'border-border flex cursor-pointer items-center gap-3 rounded-[14px] border bg-white/85 px-3.5 py-3 font-normal transition-colors dark:bg-white/5',
                        'hover:border-accent has-[[data-state=checked]]:border-info-strong has-[[data-state=checked]]:bg-info-subtle',
                      )}
                    >
                      <span
                        aria-hidden
                        className="bg-info-subtle text-info-strong flex size-9 shrink-0 items-center justify-center rounded-[11px]"
                      >
                        <LayoutTemplate className="size-4" />
                      </span>
                      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                        <span className="truncate text-sm font-medium">{t.name}</span>
                        <span className="text-text-secondary text-xs">
                          {t.durationMonths} เดือน{t.isSystem ? ' · system' : ''}
                        </span>
                      </span>
                      <RadioGroupItem id={`cp-tpl-${t.id}`} value={t.id} />
                    </Label>
                  ))}
                </RadioGroup>
              )}
              <FieldError error={errors.templateId} id="cp-template-err" />
            </div>
          </TabsContent>

          <TabsContent value="clone" className="m-0 p-0">
            <div className="grid gap-1.5">
              <Label htmlFor="cp-clone" className="text-[13px]">
                Clone จากแผน <Required />
              </Label>
              {plansLoading ? (
                <Skeleton className="h-11 w-full rounded-[12px]" />
              ) : (
                <Select
                  value={cloneFromPlanId}
                  onValueChange={(v) => {
                    setCloneFromPlanId(v)
                    setErrors((prev) => ({ ...prev, cloneFromPlanId: '' }))
                  }}
                >
                  <SelectTrigger
                    id="cp-clone"
                    className={selectedTrigger}
                    aria-invalid={errors.cloneFromPlanId ? true : undefined}
                    aria-describedby={errors.cloneFromPlanId ? 'cp-clone-err' : undefined}
                  >
                    <SelectValue placeholder="เลือกแผนต้นทาง" />
                  </SelectTrigger>
                  <SelectContent>
                    {(existingPlans ?? []).length === 0 ? (
                      <div className="text-text-secondary px-3 py-2 text-sm">
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
              <FieldError error={errors.cloneFromPlanId} id="cp-clone-err" />
            </div>
          </TabsContent>
        </Tabs>

        <div className="grid gap-5">
          <div className="grid gap-1.5">
            <Label htmlFor="cp-title" className="text-[13px]">
              ชื่อแผน <Required />
            </Label>
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
              aria-required
              aria-invalid={errors.title ? true : undefined}
              aria-describedby={errors.title ? 'cp-title-err' : undefined}
            />
            <FieldError error={errors.title} id="cp-title-err" />
          </div>

          <div className="grid gap-3">
            <div
              role="group"
              aria-label="รูปแบบช่วงเวลา"
              className="bg-muted/70 grid grid-cols-1 gap-1 rounded-[14px] p-1 sm:inline-grid sm:w-fit sm:grid-cols-2"
            >
              {(
                [
                  ['monthly', 'ช่วงเดือน (ข้ามปีได้)'],
                  ['legacy', 'ไตรมาส / ครึ่งปี / กำหนดเอง'],
                ] as const
              ).map(([mode, label]) => (
                <button
                  key={mode}
                  type="button"
                  aria-pressed={rangeMode === mode}
                  onClick={() => setRangeMode(mode)}
                  className={cn(
                    'focus-visible:ring-ring/70 min-h-10 rounded-[10px] px-3.5 text-[13px] transition-colors outline-none focus-visible:ring-[3px]',
                    rangeMode === mode
                      ? 'text-foreground bg-white font-medium shadow-sm dark:bg-white/10'
                      : 'text-text-secondary hover:text-foreground',
                  )}
                >
                  {label}
                </button>
              ))}
            </div>

            {rangeMode === 'monthly' ? (
              <div className="grid gap-2">
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <div className="grid gap-1.5">
                    <Label htmlFor="cp-sm" className="text-[13px]">
                      เริ่มเดือน <Required />
                    </Label>
                    <Select
                      value={String(startMonth)}
                      onValueChange={(v) => setStartMonth(Number(v))}
                    >
                      <SelectTrigger id="cp-sm" className={selectedTrigger}>
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
                    <Label htmlFor="cp-sy" className="text-[13px]">
                      ปี
                    </Label>
                    <Select
                      value={String(startYear)}
                      onValueChange={(v) => setStartYear(Number(v))}
                    >
                      <SelectTrigger id="cp-sy" className={selectedTrigger}>
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
                    <Label htmlFor="cp-em" className="text-[13px]">
                      ถึงเดือน <Required />
                    </Label>
                    <Select value={String(endMonth)} onValueChange={(v) => setEndMonth(Number(v))}>
                      <SelectTrigger
                        id="cp-em"
                        className={selectedTrigger}
                        aria-invalid={rangeInvalid ? true : undefined}
                        aria-describedby="cp-range-hint"
                      >
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
                    <Label htmlFor="cp-ey" className="text-[13px]">
                      ปี
                    </Label>
                    <Select value={String(endYear)} onValueChange={(v) => setEndYear(Number(v))}>
                      <SelectTrigger
                        id="cp-ey"
                        className={selectedTrigger}
                        aria-invalid={rangeInvalid ? true : undefined}
                        aria-describedby="cp-range-hint"
                      >
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
                <p id="cp-range-hint" className="text-xs">
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
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-1.5">
                  <Label htmlFor="cp-period" className="text-[13px]">
                    รูปแบบ period
                  </Label>
                  <Select
                    value={periodType}
                    onValueChange={(v) => setPeriodType(v as typeof periodType)}
                  >
                    <SelectTrigger id="cp-period" className={selectedTrigger}>
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
                <div className="grid gap-1.5">
                  <Label htmlFor="cp-year" className="text-[13px]">
                    ปี (ไม่บังคับ)
                  </Label>
                  <Input
                    id="cp-year"
                    type="number"
                    inputMode="numeric"
                    min={2020}
                    max={2099}
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                  />
                </div>
              </div>
            )}

            {rangeMode === 'legacy' && periodType === 'CUSTOM' && (
              <fieldset className="grid gap-2">
                <legend className="mb-1.5 text-[13px] font-medium">
                  ชื่อแต่ละ period <Required />
                </legend>
                <div className="flex flex-col gap-2">
                  {customPeriods.map((label, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <Input
                        aria-label={`ชื่อ period ที่ ${i + 1}`}
                        value={label}
                        onChange={(e) => {
                          setCustomPeriods((prev) => {
                            const next = [...prev]
                            next[i] = e.target.value
                            return next
                          })
                          setErrors((prev) => ({ ...prev, customPeriods: '' }))
                        }}
                        placeholder={`Period ${i + 1}`}
                        maxLength={50}
                        aria-invalid={errors.customPeriods ? true : undefined}
                        aria-describedby={errors.customPeriods ? 'cp-custom-err' : undefined}
                      />
                      {customPeriods.length > 1 && (
                        <Button
                          type="button"
                          size="icon"
                          variant="ghost"
                          onClick={() =>
                            setCustomPeriods((prev) => prev.filter((_, idx) => idx !== i))
                          }
                          aria-label={`ลบ period ที่ ${i + 1}`}
                        >
                          <X className="size-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                  <FieldError error={errors.customPeriods} id="cp-custom-err" />
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
              </fieldset>
            )}
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="cp-pkg" className="text-[13px]">
              Package (ไม่บังคับ)
            </Label>
            <Input
              id="cp-pkg"
              value={packageName}
              onChange={(e) => setPackageName(e.target.value)}
              maxLength={200}
            />
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="cp-note" className="text-[13px]">
              หมายเหตุ
            </Label>
            <Textarea
              id="cp-note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
              maxLength={5000}
              placeholder="แสดงให้ลูกค้าเห็นบนหน้า Work Progress"
            />
          </div>

          {sourceText && rangeText && (
            <div
              aria-live="polite"
              className="bg-success-subtle flex items-center gap-3 rounded-[14px] px-3.5 py-3 text-sm"
            >
              <CheckCircle2 aria-hidden className="text-success size-5 shrink-0" />
              <span>
                จะสร้าง <strong className="font-semibold">{sourceText}</strong> ·{' '}
                <strong className="font-semibold">{rangeText}</strong> · แก้ไขต่อได้หลังสร้าง
              </span>
            </div>
          )}
        </div>

        <DialogFooter className="sticky bottom-0 z-10 sm:justify-between">
          <span className="text-text-secondary hidden text-xs sm:inline">
            <span className="text-danger-strong">*</span> จำเป็นต้องกรอก
          </span>
          <div className="flex flex-col-reverse gap-2.5 sm:flex-row">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              ยกเลิก
            </Button>
            <Button onClick={handleSubmit} disabled={createMut.isPending}>
              {createMut.isPending ? 'กำลังสร้าง...' : 'สร้างแผน'}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
