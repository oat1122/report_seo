'use client'

import { useEffect, useState } from 'react'
import { Loader2, CalendarIcon, Wallet } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import { useCreatePaymentPlan, useUpdatePaymentPlan } from '../../hooks/usePaymentPlans'
import { generateBillingCycles } from '../../../domain/policies/billing-cycle-generator'
import { formatAmount, formatMoney, formatPaymentDate } from '../shared/payment-view'
import type { PaymentPlan } from '../../../index'

interface PaymentPlanFormProps {
  customerId: string
  open: boolean
  onOpenChange: (open: boolean) => void
  editPlan?: PaymentPlan | null
}

const PLAN_TYPES = [
  { value: 'MONTHLY', label: 'รายเดือน' },
  { value: 'INSTALLMENT', label: 'ผ่อนชำระ (จำนวนงวด)' },
] as const

export function PaymentPlanForm({
  customerId,
  open,
  onOpenChange,
  editPlan,
}: PaymentPlanFormProps) {
  const isEdit = !!editPlan

  const [type, setType] = useState<'MONTHLY' | 'INSTALLMENT'>('MONTHLY')
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [billingDay, setBillingDay] = useState('1')
  const [totalInstallments, setTotalInstallments] = useState('12')
  const [startDate, setStartDate] = useState<Date | undefined>(new Date())
  const [note, setNote] = useState('')

  const createMutation = useCreatePaymentPlan()
  const updateMutation = useUpdatePaymentPlan()
  const isPending = createMutation.isPending || updateMutation.isPending

  const activeType = isEdit ? (editPlan.type as 'MONTHLY' | 'INSTALLMENT') : type

  useEffect(() => {
    if (editPlan && open) {
      setType(editPlan.type as 'MONTHLY' | 'INSTALLMENT')
      setAmount(String(editPlan.amount))
      setDescription(editPlan.description)
      setBillingDay(String(editPlan.billingDay ?? 1))
      setTotalInstallments(String(editPlan.totalInstallments ?? 12))
      setStartDate(new Date(editPlan.startDate))
      setNote(editPlan.note ?? '')
    } else if (!editPlan && open) {
      resetForm()
    }
  }, [editPlan, open])

  const resetForm = () => {
    setType('MONTHLY')
    setAmount('')
    setDescription('')
    setBillingDay('1')
    setTotalInstallments('12')
    setStartDate(new Date())
    setNote('')
  }

  const handleSubmit = () => {
    const parsedAmount = parseFloat(amount)
    if (!parsedAmount || !description.trim() || !startDate) return

    if (isEdit) {
      updateMutation.mutate(
        {
          customerId,
          planId: editPlan.id,
          data: {
            description: description.trim(),
            amount: parsedAmount,
            billingDay: parseInt(billingDay, 10),
            totalInstallments:
              activeType === 'INSTALLMENT' ? parseInt(totalInstallments, 10) : null,
            startDate,
            endDate: null,
            note: note.trim() || null,
          },
        },
        { onSuccess: () => onOpenChange(false) },
      )
    } else {
      createMutation.mutate(
        {
          customerId,
          plan: {
            type,
            amount: parsedAmount,
            description: description.trim(),
            billingDay: parseInt(billingDay, 10),
            totalInstallments: type === 'INSTALLMENT' ? parseInt(totalInstallments, 10) : null,
            startDate,
            note: note.trim() || null,
          },
        },
        {
          onSuccess: () => {
            resetForm()
            onOpenChange(false)
          },
        },
      )
    }
  }

  // ตัวอย่างรอบจ่ายเงินจาก policy เดียวกับที่ฝั่ง server ใช้สร้างงวดจริง (เฉพาะตอนสร้างใหม่)
  const parsedAmount = parseFloat(amount)
  const preview =
    !isEdit && startDate && parsedAmount > 0
      ? generateBillingCycles({
          type,
          amount: parsedAmount,
          startDate,
          billingDay: parseInt(billingDay, 10) || null,
          totalInstallments:
            type === 'INSTALLMENT' ? parseInt(totalInstallments, 10) || null : null,
        })
      : []
  const previewRows =
    preview.length > 4 ? [...preview.slice(0, 3), null, preview[preview.length - 1]] : preview
  const previewTotal = preview.reduce((sum, cycle) => sum + cycle.amount, 0)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[92dvh] flex-col gap-0 overflow-hidden rounded-3xl p-0 max-sm:top-auto max-sm:bottom-0 max-sm:max-w-full max-sm:translate-y-0 max-sm:rounded-b-none sm:max-w-[720px]">
        <DialogHeader className="flex-row items-start gap-3.5 px-6 pt-5.5 pr-14 pb-4 text-left">
          <span
            aria-hidden
            className="bg-info-subtle text-info-strong flex size-11 shrink-0 items-center justify-center rounded-[14px]"
          >
            <Wallet className="size-5" />
          </span>
          <div className="flex min-w-0 flex-col gap-1">
            <DialogTitle className="text-xl leading-snug font-semibold">
              {isEdit ? 'แก้ไขแผนชำระเงิน' : 'สร้างแผนชำระเงิน'}
            </DialogTitle>
            <DialogDescription className="text-text-secondary text-[13px]">
              {isEdit
                ? 'แก้ชื่อ ยอดต่องวด หรือวันเก็บเงินของแผนนี้'
                : 'ระบบจะสร้างรอบจ่ายเงินให้อัตโนมัติ'}
            </DialogDescription>
          </div>
        </DialogHeader>

        <div className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto px-6 pt-1 pb-6">
          <div className="flex flex-col gap-1.5">
            <span id="plan-type-label" className="text-[13px] font-medium">
              ประเภท
              <span aria-hidden className="text-destructive">
                {' '}
                *
              </span>
            </span>
            <ToggleGroup
              type="single"
              value={activeType}
              onValueChange={(value) => value && setType(value as 'MONTHLY' | 'INSTALLMENT')}
              disabled={isEdit}
              aria-labelledby="plan-type-label"
              className="grid w-full grid-cols-2"
            >
              {PLAN_TYPES.map((option) => (
                <ToggleGroupItem
                  key={option.value}
                  value={option.value}
                  className="h-11 w-full rounded-[10px] text-[13px] sm:h-10"
                >
                  {option.label}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
            {isEdit && (
              <span className="text-text-secondary text-xs">
                เปลี่ยนประเภทของแผนที่สร้างแล้วไม่ได้
              </span>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="plan-description" className="text-[13px] font-medium">
              ชื่อแพ็กเกจ / บริการ
              <span aria-hidden className="text-destructive">
                *
              </span>
            </Label>
            <Input
              id="plan-description"
              aria-required
              className="h-11 rounded-[12px]"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="เช่น SEO Standard Package"
            />
          </div>

          <div
            className={cn(
              'grid gap-4',
              activeType === 'INSTALLMENT' ? 'sm:grid-cols-3' : 'sm:grid-cols-2',
            )}
          >
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="plan-amount" className="text-[13px] font-medium">
                จำนวนเงินต่อรอบ
                <span aria-hidden className="text-destructive">
                  *
                </span>
              </Label>
              <div className="relative">
                <Input
                  id="plan-amount"
                  type="number"
                  inputMode="decimal"
                  aria-required
                  min={0}
                  step={0.01}
                  className="h-11 rounded-[12px] pr-12 text-right tabular-nums"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                />
                <span
                  aria-hidden
                  className="text-text-secondary pointer-events-none absolute inset-y-0 right-3 flex items-center text-[13px]"
                >
                  บาท
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="plan-billing-day" className="text-[13px] font-medium">
                เก็บเงินทุกวันที่
                <span aria-hidden className="text-destructive">
                  *
                </span>
              </Label>
              <Input
                id="plan-billing-day"
                type="number"
                inputMode="numeric"
                aria-describedby="plan-billing-day-hint"
                min={1}
                max={31}
                className="h-11 rounded-[12px] tabular-nums"
                value={billingDay}
                onChange={(e) => setBillingDay(e.target.value)}
              />
              <span id="plan-billing-day-hint" className="text-text-secondary text-xs">
                1–31 · เดือนที่มีไม่ถึงใช้วันสุดท้าย
              </span>
            </div>

            {activeType === 'INSTALLMENT' && (
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="plan-installments" className="text-[13px] font-medium">
                  จำนวนงวดทั้งหมด
                  <span aria-hidden className="text-destructive">
                    *
                  </span>
                </Label>
                <div className="relative">
                  <Input
                    id="plan-installments"
                    type="number"
                    inputMode="numeric"
                    min={1}
                    max={120}
                    className="h-11 rounded-[12px] pr-12 tabular-nums"
                    value={totalInstallments}
                    onChange={(e) => setTotalInstallments(e.target.value)}
                  />
                  <span
                    aria-hidden
                    className="text-text-secondary pointer-events-none absolute inset-y-0 right-3 flex items-center text-[13px]"
                  >
                    งวด
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="plan-start-date" className="text-[13px] font-medium">
                วันเริ่มต้น
                <span aria-hidden className="text-destructive">
                  *
                </span>
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="plan-start-date"
                    variant="outline"
                    className={cn(
                      'h-11 w-full justify-start rounded-[12px] px-3 text-left font-normal',
                      !startDate && 'text-muted-foreground',
                    )}
                  >
                    <CalendarIcon className="text-text-secondary size-4" />
                    {startDate ? formatPaymentDate(startDate) : 'เลือกวันที่'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={setStartDate}
                    defaultMonth={startDate}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="plan-note" className="text-[13px] font-medium">
                หมายเหตุ (ไม่บังคับ)
              </Label>
              <Textarea
                id="plan-note"
                className="min-h-11 resize-y rounded-[12px]"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="เช่น ส่วนลดปีที่ 2"
                rows={1}
              />
            </div>
          </div>

          {preview.length > 0 && (
            <div className="bg-info-subtle/60 border-info-subtle flex flex-col gap-2.5 rounded-2xl border p-4">
              <div className="flex items-baseline justify-between gap-3">
                <span className="text-sm font-semibold">ตัวอย่างรอบจ่ายเงิน</span>
                <span className="text-text-secondary text-xs">ยังไม่รวม VAT 7%</span>
              </div>
              <ul className="flex flex-col gap-1.5">
                {previewRows.map((cycle) =>
                  cycle === null ? (
                    <li key="gap" aria-hidden className="text-muted-foreground pl-0.5 text-[13px]">
                      …
                    </li>
                  ) : (
                    <li
                      key={cycle.cycleNumber}
                      className="grid grid-cols-[5rem_minmax(0,1fr)_auto] gap-2.5 text-[13px]"
                    >
                      <span className="font-medium">งวดที่ {cycle.cycleNumber}</span>
                      <span className="text-text-secondary">
                        {formatPaymentDate(cycle.dueDate)}
                      </span>
                      <span className="tabular-nums">{formatAmount(cycle.amount)}</span>
                    </li>
                  ),
                )}
              </ul>
              <div aria-hidden className="bg-border h-px" />
              <div className="flex justify-between gap-3 text-[15px] font-semibold">
                <span>รวม {preview.length} งวด</span>
                <span className="tabular-nums">{formatMoney(previewTotal)}</span>
              </div>
            </div>
          )}
        </div>

        <div className="border-border bg-muted/60 flex flex-col-reverse gap-2 border-t px-6 py-4 sm:flex-row sm:items-center dark:bg-white/5">
          <span className="text-text-secondary text-xs sm:mr-auto">
            <span aria-hidden className="text-destructive">
              *
            </span>{' '}
            จำเป็นต้องกรอก
          </span>
          <Button
            variant="outline"
            className="h-11 rounded-[12px] px-4"
            onClick={() => onOpenChange(false)}
          >
            ยกเลิก
          </Button>
          <Button
            className="h-11 rounded-[12px] px-4"
            onClick={handleSubmit}
            disabled={isPending || !amount || !description.trim() || !startDate}
          >
            {isPending && <Loader2 className="size-4 animate-spin" />}
            {isEdit ? 'บันทึก' : 'สร้างแผน'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
