'use client'

import { AnimatedNumber, GrowBar, Stagger, StaggerItem } from '@/components/motion'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useListBillingCycles } from '../../hooks/useBillingCycles'
import { StatusPill } from '../shared/StatusPill'
import {
  CYCLE_STATUS,
  formatAmount,
  formatMoney,
  formatPaymentDate,
  summarizeCycles,
} from '../shared/payment-view'

/** แถวสรุป 3 ใบ: งวดถัดไป · ความคืบหน้า · ยอดที่ชำระแล้ว (query เดียวกับตารางรอบจ่ายเงิน) */
export function CustomerPaymentSummary({ customerId }: { customerId: string }) {
  const { data: cycles, isLoading } = useListBillingCycles(customerId)

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-3" aria-busy="true">
        <Skeleton className="h-32 w-full rounded-[20px]" />
        <Skeleton className="h-32 w-full rounded-[20px]" />
        <Skeleton className="h-32 w-full rounded-[20px]" />
      </div>
    )
  }

  // ยังไม่มีงวด = ตารางด้านล่างบอกสถานะว่างอยู่แล้ว ไม่ต้องมีการ์ดสรุปเลขศูนย์
  if (!cycles?.length) return null

  const summary = summarizeCycles(cycles)
  const percent = summary.totalCount > 0 ? (summary.paidCount / summary.totalCount) * 100 : 0
  const next = summary.next
  const nextStatus = next ? (CYCLE_STATUS[next.status] ?? CYCLE_STATUS.PENDING) : null

  return (
    <Stagger className="grid gap-4 md:grid-cols-3">
      <StaggerItem>
        <Card className="h-full gap-2 px-5 py-5">
          <span className="text-text-secondary text-[13px] font-medium">งวดถัดไป</span>
          {next && nextStatus ? (
            <>
              <strong className="text-[32px] leading-none font-semibold tabular-nums">
                {formatAmount(next.amount)}
                <span className="text-text-secondary ml-1.5 text-sm font-normal">บาท</span>
              </strong>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-text-secondary text-[13px]">
                  งวดที่ {next.cycleNumber} · ครบกำหนด {formatPaymentDate(next.dueDate)}
                </span>
                <StatusPill tone={nextStatus.tone}>{nextStatus.label}</StatusPill>
              </div>
            </>
          ) : (
            <>
              <strong className="text-[32px] leading-none font-semibold">ครบแล้ว</strong>
              <span className="text-text-secondary text-[13px]">
                ไม่มีงวดที่ต้องชำระ ขอบคุณครับ
              </span>
            </>
          )}
        </Card>
      </StaggerItem>

      <StaggerItem>
        <Card className="h-full gap-2 px-5 py-5">
          <span className="text-text-secondary text-[13px] font-medium">ความคืบหน้า</span>
          <strong className="text-[32px] leading-none font-semibold tabular-nums">
            <AnimatedNumber value={summary.paidCount} />
            <span className="text-text-secondary text-lg font-normal">
              {' '}
              / {summary.totalCount} งวด
            </span>
          </strong>
          <div
            role="progressbar"
            aria-label={`ชำระแล้ว ${summary.paidCount} จาก ${summary.totalCount} งวด`}
            aria-valuemin={0}
            aria-valuemax={summary.totalCount}
            aria-valuenow={summary.paidCount}
            className="bg-muted mt-1 h-2.5 overflow-hidden rounded-full dark:bg-white/10"
          >
            <GrowBar value={percent} className="bg-secondary h-full rounded-full" />
          </div>
          <span className="text-text-secondary text-[13px]">
            {summary.overdueCount > 0
              ? `มีงวดเกินกำหนด ${summary.overdueCount} งวด — ชำระแล้วอัปโหลดหลักฐานได้ในตาราง`
              : 'ไม่มีงวดค้างชำระเกินกำหนด'}
          </span>
        </Card>
      </StaggerItem>

      <StaggerItem>
        <Card className="h-full gap-2 px-5 py-5">
          <span className="text-text-secondary text-[13px] font-medium">ยอดที่ชำระแล้ว</span>
          <strong className="text-[32px] leading-none font-semibold tabular-nums">
            <AnimatedNumber value={summary.paidAmount} format={formatAmount} />
            <span className="text-text-secondary ml-1.5 text-sm font-normal">บาท</span>
          </strong>
          <span className="text-text-secondary text-[13px]">
            จากทั้งหมด {formatMoney(summary.totalAmount)} (ไม่รวมงวดที่ยกเลิก)
          </span>
        </Card>
      </StaggerItem>
    </Stagger>
  )
}
