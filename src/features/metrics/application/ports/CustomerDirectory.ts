export interface CustomerSyncTarget {
  customerId: string // Customer.id (internal) — ใช้กับ MetricsRepository โดยตรง
  domain: string
  userId: string // Customer.userId — ใช้เป็น customerUserId ใน route/dialog/notification
  customerName: string
  seoDevUserId: string | null // = Customer.seoDevId (เป็น User.id อยู่แล้ว) — ผู้รับ notification
}

export interface CustomerDirectory {
  listSyncTargets(): Promise<CustomerSyncTarget[]>
  findSyncTargetByUserId(userId: string): Promise<CustomerSyncTarget | null>
}
