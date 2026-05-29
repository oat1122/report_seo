import type { BillingDocumentType } from './DocumentType'

export interface DocumentLineItem {
  description: string
  quantity: number
  unit: string
  unitPrice: number
}

export interface BillingDocument {
  id: string
  documentNumber: string
  type: BillingDocumentType
  pdfUrl: string
  totalAmount: number
  items: DocumentLineItem[] | null
  note: string | null
  dueDate: Date | null
  paidDate: Date | null
  generatedAt: Date
  customerId: string | null
  customerName: string | null
  billingCycleId: string | null
}

export interface BillingDocumentWithCycle extends BillingDocument {
  billingCycle: {
    cycleNumber: number
    dueDate: Date
    paidDate: Date | null
    amount: number
    plan: {
      id: string
      description: string
    }
  } | null
}

export interface AdminBillingDocument extends BillingDocument {
  customer: {
    id: string
    userId: string
    name: string
    domain: string
  } | null
  billingCycle: {
    cycleNumber: number
    dueDate: Date
    paidDate: Date | null
    amount: number
    plan: {
      id: string
      description: string
    }
  } | null
}
