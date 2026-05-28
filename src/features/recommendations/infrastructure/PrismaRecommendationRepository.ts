import { prisma } from '@/infrastructure/prisma/client'
import type { KeywordRecommend } from '../domain/KeywordRecommend'
import type { RecommendationRepository } from '../application/ports/RecommendationRepository'
import type { RecommendKeywordInput } from '../schemas'

type CreatePayload = RecommendKeywordInput & { note: string | null }

export class PrismaRecommendationRepository implements RecommendationRepository {
  async findByCustomerId(customerInternalId: string): Promise<KeywordRecommend[]> {
    return prisma.keywordRecommend.findMany({
      where: { customerId: customerInternalId },
      orderBy: { createdAt: 'desc' },
    })
  }

  async create(customerInternalId: string, data: CreatePayload): Promise<KeywordRecommend> {
    return prisma.keywordRecommend.create({
      data: {
        keyword: data.keyword,
        note: data.note,
        kd: data.kd ?? null,
        isTopReport: data.isTopReport ?? false,
        customerId: customerInternalId,
      },
    })
  }

  async update(recommendId: string, data: CreatePayload): Promise<KeywordRecommend> {
    return prisma.keywordRecommend.update({
      where: { id: recommendId },
      data: {
        keyword: data.keyword,
        note: data.note,
        kd: data.kd ?? null,
        isTopReport: data.isTopReport ?? false,
      },
    })
  }

  async delete(recommendId: string): Promise<void> {
    await prisma.keywordRecommend.delete({ where: { id: recommendId } })
  }
}
