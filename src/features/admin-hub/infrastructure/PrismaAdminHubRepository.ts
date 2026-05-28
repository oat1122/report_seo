import { prisma } from '@/infrastructure/prisma/client'
import type { AdminHubRepository } from '../application/ports/AdminHubRepository'
import type { AdminHubSummary, CustomerHubCard } from '../domain/AdminHubSummary'

export class PrismaAdminHubRepository implements AdminHubRepository {
  async getHubSummary(): Promise<AdminHubSummary> {
    const [roleCounts, customers, avgProgressByCustomer] = await Promise.all([
      this.getUserCountsByRole(),
      this.getCustomersWithDetails(),
      this.getWorkProgressAvgByCustomer(),
    ])

    const avgMap = new Map(avgProgressByCustomer.map((r) => [r.customerId, r.avgPercent]))

    const customerCards: CustomerHubCard[] = customers.map((c) => ({
      id: c.id,
      name: c.name,
      domain: c.domain,
      userId: c.userId,
      seoDevName: c.seoDev?.name ?? null,
      createdAt: c.user.createdAt.toISOString(),
      metrics: c.metrics
        ? {
            domainRating: c.metrics.domainRating,
            healthScore: c.metrics.healthScore,
            organicTraffic: c.metrics.organicTraffic,
            organicKeywords: c.metrics.organicKeywords,
            backlinks: c.metrics.backlinks,
            refDomains: c.metrics.refDomains,
            spamScore: c.metrics.spamScore,
          }
        : null,
      counts: {
        keywords: c._count.reports,
        recommendations: c._count.recommendations,
        aiOverviews: c._count.aiOverviews,
        paymentPlans: c._count.paymentPlans,
        workProgressPlans: c._count.workProgressPlans,
      },
      workProgressAvgPercent: avgMap.get(c.id) ?? null,
    }))

    return {
      userCounts: {
        ADMIN: roleCounts.get('ADMIN') ?? 0,
        SEO_DEV: roleCounts.get('SEO_DEV') ?? 0,
        CUSTOMER: roleCounts.get('CUSTOMER') ?? 0,
      },
      customers: customerCards,
    }
  }

  private async getUserCountsByRole() {
    const groups = await prisma.user.groupBy({
      by: ['role'],
      _count: true,
      where: { deletedAt: null },
    })
    return new Map(groups.map((g) => [g.role, g._count]))
  }

  private async getCustomersWithDetails() {
    return prisma.customer.findMany({
      include: {
        user: { select: { id: true, name: true, email: true, createdAt: true } },
        seoDev: { select: { id: true, name: true } },
        metrics: {
          select: {
            domainRating: true,
            healthScore: true,
            organicTraffic: true,
            organicKeywords: true,
            backlinks: true,
            refDomains: true,
            spamScore: true,
          },
        },
        _count: {
          select: {
            reports: true,
            recommendations: true,
            aiOverviews: true,
            paymentPlans: true,
            workProgressPlans: true,
          },
        },
      },
      orderBy: { user: { createdAt: 'desc' } },
    })
  }

  private async getWorkProgressAvgByCustomer(): Promise<
    Array<{ customerId: string; avgPercent: number }>
  > {
    const rows = await prisma.$queryRaw<Array<{ customerId: string; avgPercent: number }>>`
      SELECT p.customerId, ROUND(AVG(i.progressPercent)) as avgPercent
      FROM workprogressplan p
      JOIN workprogressitem i ON i.planId = p.id
      WHERE p.isArchived = false
      GROUP BY p.customerId
    `
    return rows.map((r) => ({
      customerId: r.customerId,
      avgPercent: Number(r.avgPercent),
    }))
  }
}
