import type { BillingDocumentType } from '../../../domain/DocumentType'

// สีป้ายประเภทเอกสาร (artboard Admin-Documents) — ใช้ token เท่านั้น
export const DOCUMENT_TYPE_BADGE: Record<BillingDocumentType, string> = {
  BILLING_NOTE: 'bg-muted text-foreground',
  INVOICE: 'bg-info-subtle text-foreground',
  RECEIPT: 'bg-secondary/25 text-foreground',
  TAX_INVOICE: 'bg-warning-subtle text-warning-text',
}

// จุดสีหน้าชื่อประเภทในการ์ดตัวกรอง
export const DOCUMENT_TYPE_SWATCH: Record<BillingDocumentType, string> = {
  BILLING_NOTE: 'bg-border',
  INVOICE: 'bg-accent',
  RECEIPT: 'bg-secondary',
  TAX_INVOICE: 'bg-warning-accent',
}

/** จำนวนเงินแบบ 26,750.00 (ไม่รวมหน่วย) */
export function formatMoney(amount: number | string): string {
  return Number(amount).toLocaleString('th-TH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

/** วันที่ ค.ศ. แบบสั้น เช่น 28 ก.ย. 2026 */
export { formatDateCE as formatDocDate } from '@/lib/date'
