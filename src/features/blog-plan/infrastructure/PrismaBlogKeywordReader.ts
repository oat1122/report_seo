import { prisma } from '@/infrastructure/prisma/client'
import type { CustomerKeywordOption } from '../domain/BlogArticle'
import type { BlogKeywordReader } from '../application/ports/BlogKeywordReader'

type KeywordOption = Omit<CustomerKeywordOption, 'usedCount'>

export class PrismaBlogKeywordReader implements BlogKeywordReader {
  async listByCustomer(customerId: string): Promise<KeywordOption[]> {
    const [tracked, recommended] = await Promise.all([
      prisma.keywordReport.findMany({
        where: { customerId },
        select: { id: true, keyword: true, position: true, kd: true },
        orderBy: { keyword: 'asc' },
      }),
      prisma.keywordRecommend.findMany({
        where: { customerId },
        select: { id: true, keyword: true, kd: true },
        orderBy: { keyword: 'asc' },
      }),
    ])

    const options: KeywordOption[] = [
      ...tracked.map((row) => ({
        keyword: row.keyword,
        source: 'REPORT' as const,
        sourceId: row.id,
        position: row.position,
        kd: row.kd,
      })),
      ...recommended.map((row) => ({
        keyword: row.keyword,
        source: 'RECOMMEND' as const,
        sourceId: row.id,
        position: null,
        kd: row.kd,
      })),
    ]

    // keyword เดียวกันอาจอยู่ทั้งสองตาราง — เก็บตัวที่ track อยู่จริงไว้ก่อน
    const byKeyword = new Map<string, KeywordOption>()
    for (const option of options) {
      const key = option.keyword.toLowerCase()
      const existing = byKeyword.get(key)
      if (!existing || (existing.source === 'RECOMMEND' && option.source === 'REPORT')) {
        byKeyword.set(key, option)
      }
    }

    return [...byKeyword.values()].sort((a, b) => a.keyword.localeCompare(b.keyword, 'th'))
  }
}
