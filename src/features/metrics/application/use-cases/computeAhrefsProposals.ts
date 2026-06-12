import type { CustomerDirectory } from '../ports/CustomerDirectory'
import type { MetricsRepository } from '../ports/MetricsRepository'
import type { AhrefsFullMetrics, AhrefsMetricsGateway } from '../ports/AhrefsMetricsGateway'

export interface AhrefsProposalCurrent {
  domainRating: number
  healthScore: number
  organicTraffic: number
  organicKeywords: number
  backlinks: number
  refDomains: number
}

export interface AhrefsProposal {
  customerUserId: string
  customerName: string
  domain: string
  seoDevUserId: string | null
  proposed: AhrefsFullMetrics
  current: AhrefsProposalCurrent
}

// ค่าใหม่ต่างจากค่าเดิมไหม — health เทียบเฉพาะเมื่อ Ahrefs คืน health มา (ไม่ null)
function hasChange(proposed: AhrefsFullMetrics, current: AhrefsProposalCurrent): boolean {
  return (
    proposed.domainRating !== current.domainRating ||
    proposed.organicTraffic !== current.organicTraffic ||
    proposed.organicKeywords !== current.organicKeywords ||
    proposed.backlinks !== current.backlinks ||
    proposed.refDomains !== current.refDomains ||
    (proposed.healthScore !== null && proposed.healthScore !== current.healthScore)
  )
}

// cron รายสัปดาห์: ดึงค่าจาก Ahrefs + เทียบกับค่าปัจจุบัน คืนเฉพาะลูกค้าที่ค่าเปลี่ยน (ไม่เขียน DB)
// ฝั่ง metrics ล้วน — ไม่รู้จัก notification/admin (ผู้เรียกใน composition root เป็นคนยิง notification)
export function computeAhrefsProposalsUseCase(
  directory: CustomerDirectory,
  repo: MetricsRepository,
  ahrefs: AhrefsMetricsGateway,
) {
  return async (date: string): Promise<AhrefsProposal[]> => {
    const targets = await directory.listSyncTargets()
    const proposals: AhrefsProposal[] = []
    // sequential — เคารพ rate limit ของ Ahrefs
    for (const target of targets) {
      try {
        const existing = await repo.findByCustomerId(target.customerId)
        if (!existing) continue // ข้ามลูกค้าที่ยังไม่มีแถว metrics (ไม่สร้าง 0-filled)

        const proposed = await ahrefs.fetchFullMetrics(target.domain, date)
        const current: AhrefsProposalCurrent = {
          domainRating: existing.domainRating,
          healthScore: existing.healthScore,
          organicTraffic: existing.organicTraffic,
          organicKeywords: existing.organicKeywords,
          backlinks: existing.backlinks,
          refDomains: existing.refDomains,
        }
        if (!hasChange(proposed, current)) continue

        proposals.push({
          customerUserId: target.userId,
          customerName: target.customerName,
          domain: target.domain,
          seoDevUserId: target.seoDevUserId,
          proposed,
          current,
        })
      } catch {
        // ลูกค้ารายนี้ดึงไม่สำเร็จ — ข้าม ไม่ให้ batch ล้มทั้งก้อน
        continue
      }
    }
    return proposals
  }
}
