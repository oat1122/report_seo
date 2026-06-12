export interface AhrefsDomainMetrics {
  domainRating: number
  backlinks: number
  refDomains: number
}

export interface AhrefsMetricsGateway {
  // date = YYYY-MM-DD. throw เมื่อ API error / timeout / payload ไม่ถูกต้อง
  // (ผู้เรียกจับ error เองเพื่อกัน batch ทั้งก้อนล้ม)
  fetchDomainMetrics(domain: string, date: string): Promise<AhrefsDomainMetrics>
}
