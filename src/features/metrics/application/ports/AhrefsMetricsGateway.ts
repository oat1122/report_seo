export interface AhrefsDomainMetrics {
  domainRating: number
  backlinks: number
  refDomains: number
}

// ครบทั้ง 6 ค่าที่ปุ่มซิงก์/cron ดึงมาเสนอ — healthScore = null เมื่อโดเมนไม่มี Site Audit project
export interface AhrefsFullMetrics {
  domainRating: number
  organicTraffic: number
  organicKeywords: number
  backlinks: number
  refDomains: number
  healthScore: number | null
}

export interface AhrefsMetricsGateway {
  // date = YYYY-MM-DD. throw เมื่อ API error / timeout / payload ไม่ถูกต้อง
  // (ผู้เรียกจับ error เองเพื่อกัน batch ทั้งก้อนล้ม)
  fetchDomainMetrics(domain: string, date: string): Promise<AhrefsDomainMetrics>
  // ดึงครบ 6 ค่า สำหรับ flow เสนอ-รีวิว-บันทึก. healthScore เป็น best-effort (null ได้)
  fetchFullMetrics(domain: string, date: string): Promise<AhrefsFullMetrics>
}
