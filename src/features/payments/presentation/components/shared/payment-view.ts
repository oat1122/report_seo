// helper ระดับ view ของหน้าการชำระเงิน — pure ทั้งหมด ไม่แตะ React/network

import type { BillingCycleStatus, BillingCycleWithPlan } from '../../../domain/BillingCycle'
import type { PaymentPlanStatus, PaymentPlanType } from '../../../domain/PaymentPlan'

/** วันที่ ค.ศ. + เดือนย่อไทย ตามกฎ UI Kit: "28 ก.ย. 2026" */
const DATE_FORMAT = new Intl.DateTimeFormat('th-TH-u-ca-gregory', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
})
const TIME_FORMAT = new Intl.DateTimeFormat('th-TH', {
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
})
const AMOUNT_FORMAT = new Intl.NumberFormat('th-TH', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

export function formatPaymentDate(date: Date | string | null | undefined): string {
  if (!date) return '—'
  return DATE_FORMAT.format(new Date(date))
}

/** "26 ก.ย. 2026 14:32 น." */
export function formatPaymentDateTime(date: Date | string): string {
  return `${formatPaymentDate(date)} ${TIME_FORMAT.format(new Date(date))} น.`
}

/** "26,750.00" — ใช้ในตารางที่หัวคอลัมน์บอกหน่วยแล้ว */
export function formatAmount(amount: number): string {
  return AMOUNT_FORMAT.format(amount)
}

/** "26,750.00 บาท" */
export function formatMoney(amount: number): string {
  return `${formatAmount(amount)} บาท`
}

/** anchor ของการ์ดหลักฐานการโอน — ปุ่ม "ตรวจหลักฐาน" ในตารางรอบจ่ายเงินเลื่อนมาที่นี่ */
export const PROOF_SECTION_ID = 'payment-proofs'

export type StatusTone = 'success' | 'danger' | 'warning' | 'info' | 'neutral'

interface StatusMeta {
  label: string
  tone: StatusTone
}

export const CYCLE_STATUS: Record<BillingCycleStatus, StatusMeta> = {
  PENDING: { label: 'รอชำระ', tone: 'warning' },
  REVIEWING: { label: 'กำลังตรวจสอบหลักฐาน', tone: 'info' },
  PAID: { label: 'ชำระแล้ว', tone: 'success' },
  OVERDUE: { label: 'เกินกำหนด', tone: 'danger' },
  CANCELLED: { label: 'ยกเลิก', tone: 'neutral' },
}

export const PROOF_STATUS: Record<string, StatusMeta> = {
  PENDING: { label: 'รอตรวจสอบ', tone: 'warning' },
  APPROVED: { label: 'อนุมัติ', tone: 'success' },
  REJECTED: { label: 'ปฏิเสธ', tone: 'danger' },
}

export const PLAN_STATUS: Record<PaymentPlanStatus, StatusMeta> = {
  ACTIVE: { label: 'ใช้งาน', tone: 'success' },
  COMPLETED: { label: 'เสร็จสิ้น', tone: 'info' },
  CANCELLED: { label: 'ยกเลิก', tone: 'neutral' },
}

export const PLAN_TYPE_LABEL: Record<PaymentPlanType, string> = {
  MONTHLY: 'รายเดือน',
  INSTALLMENT: 'ผ่อนชำระ',
}

export interface CycleSummary {
  totalCount: number
  paidCount: number
  overdueCount: number
  totalAmount: number
  paidAmount: number
  /** งวดที่ยังไม่จ่ายซึ่งครบกำหนดเร็วที่สุด · null = จ่ายครบแล้ว */
  next: BillingCycleWithPlan | null
}

/** สรุปความคืบหน้าของชุดงวด — ไม่นับงวดที่ถูกยกเลิก */
export function summarizeCycles(cycles: BillingCycleWithPlan[]): CycleSummary {
  const active = cycles.filter((cycle) => cycle.status !== 'CANCELLED')
  const paid = active.filter((cycle) => cycle.status === 'PAID')
  const next =
    active
      .filter((cycle) => cycle.status !== 'PAID')
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())[0] ?? null

  return {
    totalCount: active.length,
    paidCount: paid.length,
    overdueCount: active.filter((cycle) => cycle.status === 'OVERDUE').length,
    totalAmount: active.reduce((sum, cycle) => sum + cycle.amount, 0),
    paidAmount: paid.reduce((sum, cycle) => sum + cycle.amount, 0),
    next,
  }
}
