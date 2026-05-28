// ต้องใช้ extended prisma (`@/infrastructure/prisma/client`) เท่านั้น
// เพื่อให้ middleware ใน client.ts สร้าง OverallMetricsHistory snapshot อัตโนมัติ
// ตอน update/upsert — ห้ามใช้ prismaBase ที่นี่ (จะ silently skip history)
import { prisma } from '@/infrastructure/prisma/client'
import type { OverallMetrics, MetricsHistoryEntry } from '../domain/OverallMetrics'
import type { MetricsRepository } from '../application/ports/MetricsRepository'
import type { MetricsInput } from '../schemas'

export class PrismaMetricsRepository implements MetricsRepository {
  async findByCustomerId(customerInternalId: string): Promise<OverallMetrics | null> {
    return prisma.overallMetrics.findUnique({
      where: { customerId: customerInternalId },
    })
  }

  async upsert(customerInternalId: string, data: MetricsInput): Promise<OverallMetrics> {
    const createData = {
      domainRating: data.domainRating ?? 0,
      healthScore: data.healthScore ?? 0,
      ageInYears: data.ageInYears ?? 0,
      ageInMonths: data.ageInMonths ?? 0,
      spamScore: data.spamScore ?? 0,
      organicTraffic: data.organicTraffic ?? 0,
      organicKeywords: data.organicKeywords ?? 0,
      backlinks: data.backlinks ?? 0,
      refDomains: data.refDomains ?? 0,
      customerId: customerInternalId,
    }

    return prisma.overallMetrics.upsert({
      where: { customerId: customerInternalId },
      update: data,
      create: createData,
    })
  }

  async findHistory(
    customerInternalId: string,
    options: { onlyVisible: boolean },
  ): Promise<MetricsHistoryEntry[]> {
    return prisma.overallMetricsHistory.findMany({
      where: {
        customerId: customerInternalId,
        ...(options.onlyVisible ? { isVisible: true } : {}),
      },
      orderBy: { dateRecorded: 'desc' },
    })
  }

  async setVisibility(
    historyId: string,
    isVisible: boolean,
    customerInternalId: string,
  ): Promise<{ updated: number }> {
    const result = await prisma.overallMetricsHistory.updateMany({
      where: { id: historyId, customerId: customerInternalId },
      data: { isVisible },
    })
    return { updated: result.count }
  }

  async setVisibilityBulk(
    historyIds: string[],
    isVisible: boolean,
    customerInternalId: string,
  ): Promise<{ updated: number }> {
    const result = await prisma.overallMetricsHistory.updateMany({
      where: { id: { in: historyIds }, customerId: customerInternalId },
      data: { isVisible },
    })
    return { updated: result.count }
  }
}
