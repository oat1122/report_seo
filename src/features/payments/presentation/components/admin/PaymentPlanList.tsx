'use client'

import { useState } from 'react'
import { Loader2, Pencil, Plus, Undo2, Wallet, XCircle } from 'lucide-react'
import { GrowBar, Stagger, StaggerItem } from '@/components/motion'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  useListPaymentPlans,
  useCancelPaymentPlan,
  useReactivatePaymentPlan,
} from '../../hooks/usePaymentPlans'
import { useListBillingCycles } from '../../hooks/useBillingCycles'
import { PaymentPlanForm } from './PaymentPlanForm'
import { StatusPill } from '../shared/StatusPill'
import {
  CYCLE_STATUS,
  formatAmount,
  formatMoney,
  formatPaymentDate,
  PLAN_STATUS,
  PLAN_TYPE_LABEL,
  summarizeCycles,
} from '../shared/payment-view'
import type { BillingCycleWithPlan, PaymentPlan } from '../../../index'

interface PaymentPlanListProps {
  customerId: string
}

type ConfirmAction = { type: 'cancel' | 'reactivate'; plan: PaymentPlan }

export function PaymentPlanList({ customerId }: PaymentPlanListProps) {
  const [showForm, setShowForm] = useState(false)
  const [editingPlan, setEditingPlan] = useState<PaymentPlan | null>(null)
  const [confirmAction, setConfirmAction] = useState<ConfirmAction | null>(null)
  const { data: plans, isLoading } = useListPaymentPlans(customerId)
  // query เดียวกับตารางรอบจ่ายเงิน (cache ร่วมกัน) — ใช้คำนวณความคืบหน้าของแต่ละแผน
  const { data: cycles, isLoading: isLoadingCycles } = useListBillingCycles(customerId)
  const cancelMutation = useCancelPaymentPlan()
  const reactivateMutation = useReactivatePaymentPlan()

  const handleEdit = (plan: PaymentPlan) => {
    setEditingPlan(plan)
    setShowForm(true)
  }

  const handleConfirm = () => {
    if (!confirmAction) return
    const { type, plan } = confirmAction
    if (type === 'cancel') {
      cancelMutation.mutate({ customerId, planId: plan.id })
    } else {
      reactivateMutation.mutate({ customerId, planId: plan.id })
    }
    setConfirmAction(null)
  }

  const isCancel = confirmAction?.type === 'cancel'
  const activeCount = plans?.filter((plan) => plan.status === 'ACTIVE').length ?? 0

  return (
    <section aria-labelledby="payment-plans-title" className="flex flex-col gap-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-col gap-1">
          <h2 id="payment-plans-title" className="text-xl font-semibold">
            แผนชำระเงิน
          </h2>
          <p className="text-text-secondary text-[13px]">
            {isLoading
              ? 'กำลังโหลดแผนชำระเงิน…'
              : plans && plans.length > 0
                ? `ทั้งหมด ${plans.length} แผน · ใช้งานอยู่ ${activeCount} แผน · ระบบสร้างรอบจ่ายเงินให้อัตโนมัติ`
                : 'สร้างแผนแล้วระบบจะสร้างรอบจ่ายเงินให้อัตโนมัติ'}
          </p>
        </div>
        <Button className="h-11 rounded-[12px] px-4" onClick={() => setShowForm(true)}>
          <Plus className="size-4" />
          สร้างแผนใหม่
        </Button>
      </div>

      {isLoading ? (
        <Skeleton className="h-36 w-full rounded-[20px]" />
      ) : plans?.length === 0 ? (
        <Card className="items-center gap-3 px-6 py-10 text-center">
          <span
            aria-hidden
            className="bg-info-subtle text-info-strong flex size-12 items-center justify-center rounded-[14px]"
          >
            <Wallet className="size-5" />
          </span>
          <p className="text-sm font-medium">ยังไม่มีแผนชำระเงิน</p>
          <p className="text-text-secondary max-w-sm text-[13px]">
            กด “สร้างแผนใหม่” เพื่อกำหนดยอดต่องวดและวันเก็บเงิน
            รอบจ่ายเงินจะขึ้นในตารางด้านล่างทันที
          </p>
        </Card>
      ) : (
        <Stagger className="flex flex-col gap-4">
          {plans?.map((plan) => (
            <StaggerItem key={plan.id}>
              <PlanCard
                plan={plan}
                cycles={cycles?.filter((cycle) => cycle.planId === plan.id) ?? []}
                isLoadingCycles={isLoadingCycles}
                isCancelling={cancelMutation.isPending}
                isReactivating={reactivateMutation.isPending}
                onEdit={() => handleEdit(plan)}
                onCancel={() => setConfirmAction({ type: 'cancel', plan })}
                onReactivate={() => setConfirmAction({ type: 'reactivate', plan })}
              />
            </StaggerItem>
          ))}
        </Stagger>
      )}

      <PaymentPlanForm
        customerId={customerId}
        open={showForm}
        onOpenChange={(open) => {
          setShowForm(open)
          if (!open) setEditingPlan(null)
        }}
        editPlan={editingPlan}
      />

      <AlertDialog
        open={!!confirmAction}
        onOpenChange={(open) => {
          if (!open) setConfirmAction(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {isCancel
                ? `ยกเลิกแผน “${confirmAction?.plan.description}” ?`
                : `ย้อนสถานะแผน “${confirmAction?.plan.description}” ?`}
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <ul className="text-text-secondary flex list-disc flex-col gap-1 pl-5 text-left text-sm">
                {isCancel ? (
                  <>
                    <li>แผนจะเปลี่ยนสถานะเป็น “ยกเลิก”</li>
                    <li>รอบจ่ายที่ยังไม่ชำระจะถูกยกเลิกด้วย งวดที่ชำระแล้วยังอยู่ครบ</li>
                    <li>กด “ย้อนสถานะ” ภายหลังเพื่อกลับมาใช้แผนนี้ได้</li>
                  </>
                ) : (
                  <>
                    <li>แผนจะกลับมาเป็น “ใช้งาน”</li>
                    <li>รอบจ่ายที่ถูกยกเลิกจะกลับเป็น “รอชำระ”</li>
                  </>
                )}
              </ul>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>ไม่ใช่ตอนนี้</AlertDialogCancel>
            <AlertDialogAction
              variant={isCancel ? 'destructive' : 'default'}
              onClick={handleConfirm}
            >
              {isCancel ? 'ยกเลิกแผน' : 'ย้อนสถานะ'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  )
}

function PlanCard({
  plan,
  cycles,
  isLoadingCycles,
  isCancelling,
  isReactivating,
  onEdit,
  onCancel,
  onReactivate,
}: {
  plan: PaymentPlan
  cycles: BillingCycleWithPlan[]
  isLoadingCycles: boolean
  isCancelling: boolean
  isReactivating: boolean
  onEdit: () => void
  onCancel: () => void
  onReactivate: () => void
}) {
  const status = PLAN_STATUS[plan.status] ?? PLAN_STATUS.ACTIVE
  const summary = summarizeCycles(cycles)
  const percent = summary.totalCount > 0 ? (summary.paidCount / summary.totalCount) * 100 : 0
  const headingId = `plan-${plan.id}`

  return (
    <Card
      role="region"
      aria-labelledby={headingId}
      className="gap-5 px-5 py-5 sm:px-6 lg:grid lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)_auto] lg:items-center lg:gap-6"
    >
      <div className="flex min-w-0 flex-col gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <h3 id={headingId} className="text-[19px] leading-snug font-semibold">
            {plan.description}
          </h3>
          <StatusPill tone={status.tone}>{status.label}</StatusPill>
          <span className="bg-info-subtle text-foreground rounded-full px-2.5 py-0.5 text-xs font-medium">
            {PLAN_TYPE_LABEL[plan.type] ?? plan.type}
          </span>
        </div>
        <p className="text-sm">
          <strong className="text-xl font-semibold tabular-nums">
            {formatAmount(plan.amount)}
          </strong>{' '}
          บาท / งวด
          {plan.billingDay ? ` · ทุกวันที่ ${plan.billingDay}` : ''}
          {plan.type === 'INSTALLMENT' && plan.totalInstallments
            ? ` · ${plan.totalInstallments} งวด`
            : ''}
        </p>
        <p className="text-text-secondary text-xs">
          เริ่ม {formatPaymentDate(plan.startDate)}
          {plan.endDate && ` — สิ้นสุด ${formatPaymentDate(plan.endDate)}`}
        </p>
        {plan.note && (
          <p className="text-text-secondary text-[13px] leading-relaxed">{plan.note}</p>
        )}
      </div>

      <div className="flex min-w-0 flex-col gap-2">
        {isLoadingCycles ? (
          <>
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-full rounded-full" />
          </>
        ) : summary.totalCount === 0 ? (
          <p className="text-text-secondary text-[13px]">ไม่มีงวดที่ต้องชำระในแผนนี้</p>
        ) : (
          <>
            <div className="flex flex-wrap items-baseline justify-between gap-x-3 text-[13px]">
              <span className="text-text-secondary">
                ชำระแล้ว{' '}
                <span className="tabular-nums">
                  {summary.paidCount} / {summary.totalCount}
                </span>{' '}
                งวด
              </span>
              <strong className="font-semibold tabular-nums">
                {formatAmount(summary.paidAmount)} / {formatMoney(summary.totalAmount)}
              </strong>
            </div>
            <div
              role="progressbar"
              aria-label={`ชำระแล้ว ${summary.paidCount} จาก ${summary.totalCount} งวด`}
              aria-valuemin={0}
              aria-valuemax={summary.totalCount}
              aria-valuenow={summary.paidCount}
              className="bg-muted h-3 overflow-hidden rounded-full dark:bg-white/10"
            >
              <GrowBar value={percent} className="bg-secondary h-full rounded-full" />
            </div>
            <span className="text-text-secondary text-xs">
              {summary.next
                ? `งวดถัดไป: งวดที่ ${summary.next.cycleNumber} · ${formatPaymentDate(summary.next.dueDate)} · ${CYCLE_STATUS[summary.next.status].label}`
                : 'ชำระครบทุกงวดแล้ว'}
            </span>
          </>
        )}
      </div>

      <div className="flex flex-wrap gap-2 lg:flex-col lg:items-stretch">
        {plan.status === 'ACTIVE' && (
          <>
            <Button
              variant="outline"
              className="h-11 flex-1 rounded-[12px] px-4 lg:h-10"
              onClick={onEdit}
            >
              <Pencil className="size-4" />
              แก้ไข
            </Button>
            <Button
              variant="ghost"
              className="text-danger-strong hover:bg-danger-subtle hover:text-danger-strong h-11 flex-1 rounded-[12px] px-4 lg:h-10"
              onClick={onCancel}
              disabled={isCancelling}
            >
              {isCancelling ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <XCircle className="size-4" />
              )}
              ยกเลิกแผน
            </Button>
          </>
        )}
        {plan.status === 'CANCELLED' && (
          <Button
            variant="outline"
            className="h-11 flex-1 rounded-[12px] px-4 lg:h-10"
            onClick={onReactivate}
            disabled={isReactivating}
          >
            {isReactivating ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Undo2 className="size-4" />
            )}
            ย้อนสถานะ
          </Button>
        )}
      </div>
    </Card>
  )
}
