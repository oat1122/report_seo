import { prisma } from '@/infrastructure/prisma/client'
import type { Customer } from '../domain/Customer'
import type { CustomerRepository } from '../application/ports/CustomerRepository'

const customerSelect = {
  id: true,
  userId: true,
  seoDevId: true,
} as const

export class PrismaCustomerRepository implements CustomerRepository {
  async findByUserId(userId: string): Promise<Customer | null> {
    return prisma.customer.findUnique({
      where: { userId },
      select: customerSelect,
    })
  }

  async findById(id: string): Promise<Customer | null> {
    return prisma.customer.findUnique({
      where: { id },
      select: customerSelect,
    })
  }

  async findByKeywordId(keywordId: string): Promise<Customer | null> {
    const keyword = await prisma.keywordReport.findUnique({
      where: { id: keywordId },
      select: { customer: { select: customerSelect } },
    })
    return keyword?.customer ?? null
  }

  async findByRecommendId(recommendId: string): Promise<Customer | null> {
    const recommend = await prisma.keywordRecommend.findUnique({
      where: { id: recommendId },
      select: { customer: { select: customerSelect } },
    })
    return recommend?.customer ?? null
  }

  async findByAiOverviewId(aiOverviewId: string): Promise<Customer | null> {
    const aiOverview = await prisma.aiOverview.findUnique({
      where: { id: aiOverviewId },
      select: { customer: { select: customerSelect } },
    })
    return aiOverview?.customer ?? null
  }
}
