import { z } from 'zod'

export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
})

export type PageQuery = z.infer<typeof paginationQuerySchema>

export type PageMeta = {
  page: number
  limit: number
  total: number
}

export type PageInfo = PageMeta & { totalPages: number }

export function toPrismaSkipTake({ page, limit }: PageQuery): { skip: number; take: number } {
  return { skip: (page - 1) * limit, take: limit }
}

export function buildPageInfo({ page, limit, total }: PageMeta): PageInfo {
  return {
    page,
    limit,
    total,
    totalPages: Math.max(1, Math.ceil(total / Math.max(1, limit))),
  }
}
