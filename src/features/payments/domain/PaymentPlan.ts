export type PaymentPlanType = 'MONTHLY' | 'INSTALLMENT'
export type PaymentPlanStatus = 'ACTIVE' | 'COMPLETED' | 'CANCELLED'

export interface PaymentPlan {
  id: string
  customerId: string
  type: PaymentPlanType
  amount: number
  description: string
  billingDay: number | null
  totalInstallments: number | null
  startDate: Date
  endDate: Date | null
  status: PaymentPlanStatus
  note: string | null
  createdAt: Date
  updatedAt: Date
}

export interface PaymentPlanWithCycles extends PaymentPlan {
  billingCycles: import('./BillingCycle').BillingCycleWithProofs[]
}
