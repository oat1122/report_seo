import type { PaymentProof } from './PaymentProof'

export type BillingCycleStatus = 'PENDING' | 'REVIEWING' | 'PAID' | 'OVERDUE' | 'CANCELLED'

export interface BillingCycle {
  id: string
  planId: string
  cycleNumber: number
  dueDate: Date
  amount: number
  status: BillingCycleStatus
  paidDate: Date | null
  note: string | null
  createdAt: Date
  updatedAt: Date
}

export interface BillingCycleWithProofs extends BillingCycle {
  proofs: PaymentProof[]
}

export interface BillingCycleWithPlan extends BillingCycle {
  plan: {
    id: string
    description: string
    type: string
  }
  proofs: PaymentProof[]
  // มีเอกสารชนิดใบแจ้งหนี้ (INVOICE) ผูกกับงวดนี้แล้วหรือยัง — ใช้คุมปุ่มโหลดใบแจ้งหนี้ฝั่งลูกค้า
  hasInvoiceDocument: boolean
}
