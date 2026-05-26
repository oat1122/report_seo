import { prisma } from "@/infrastructure/prisma/client";
import type { CustomerHubRepository } from "../application/ports/CustomerHubRepository";
import type { CustomerHubSummary } from "../domain/CustomerHubSummary";

export class PrismaCustomerHubRepository implements CustomerHubRepository {
  async getHubSummary(userId: string): Promise<CustomerHubSummary> {
    const customer = await prisma.customer.findUnique({
      where: { userId },
      select: { id: true, name: true, domain: true },
    });

    if (!customer) {
      return {
        customerName: null,
        domain: null,
        metrics: null,
        counts: { keywords: 0, recommendations: 0, activeWorkPlans: 0, paymentPlans: 0 },
        workProgressAvgPercent: null,
      };
    }

    const [metrics, keywordCount, recommendCount, workPlanCount, paymentPlanCount, avgProgress] =
      await Promise.all([
        this.getMetrics(customer.id),
        prisma.keywordReport.count({ where: { customerId: customer.id } }),
        prisma.keywordRecommend.count({ where: { customerId: customer.id } }),
        prisma.workProgressPlan.count({ where: { customerId: customer.id, isArchived: false } }),
        prisma.paymentPlan.count({ where: { customerId: customer.id } }),
        this.getWorkProgressAvg(customer.id),
      ]);

    return {
      customerName: customer.name,
      domain: customer.domain,
      metrics: metrics
        ? {
            domainRating: metrics.domainRating,
            healthScore: metrics.healthScore,
            organicTraffic: metrics.organicTraffic,
            organicKeywords: metrics.organicKeywords,
            backlinks: metrics.backlinks,
            refDomains: metrics.refDomains,
          }
        : null,
      counts: {
        keywords: keywordCount,
        recommendations: recommendCount,
        activeWorkPlans: workPlanCount,
        paymentPlans: paymentPlanCount,
      },
      workProgressAvgPercent: avgProgress,
    };
  }

  private async getMetrics(customerId: string) {
    return prisma.overallMetrics.findUnique({
      where: { customerId },
      select: {
        domainRating: true,
        healthScore: true,
        organicTraffic: true,
        organicKeywords: true,
        backlinks: true,
        refDomains: true,
      },
    });
  }

  private async getWorkProgressAvg(customerId: string): Promise<number | null> {
    const rows = await prisma.$queryRaw<Array<{ avgPercent: number }>>`
      SELECT ROUND(AVG(i.progressPercent)) as avgPercent
      FROM workprogressplan p
      JOIN workprogressitem i ON i.planId = p.id
      WHERE p.customerId = ${customerId} AND p.isArchived = false
    `;
    return rows.length > 0 && rows[0].avgPercent != null
      ? Number(rows[0].avgPercent)
      : null;
  }
}
