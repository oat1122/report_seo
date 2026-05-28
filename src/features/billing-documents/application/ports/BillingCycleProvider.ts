export interface BillingCycleInfo {
  id: string
  cycleNumber: number
  dueDate: Date
  paidDate: Date | null
  amount: number
  planId: string
  planDescription: string
  planCustomerId: string
  planDocumentTemplateId: string | null
}

export interface BillingCycleProvider {
  getCycleById(cycleId: string): Promise<BillingCycleInfo | null>
  listCyclesByCustomer(customerId: string): Promise<BillingCycleInfo[]>
}
