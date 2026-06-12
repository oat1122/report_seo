export interface CustomerSyncTarget {
  customerId: string // Customer.id (internal) — ใช้กับ MetricsRepository โดยตรง
  domain: string
}

export interface CustomerDirectory {
  listSyncTargets(): Promise<CustomerSyncTarget[]>
  findSyncTargetByUserId(userId: string): Promise<CustomerSyncTarget | null>
}
