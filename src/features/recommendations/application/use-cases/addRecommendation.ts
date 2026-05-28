import { recommendKeywordSchema, normalizeNote } from '../../schemas'
import { BadRequestError } from '@/lib/errors'
import type { RecommendationRepository } from '../ports/RecommendationRepository'

export function addRecommendationUseCase(repo: RecommendationRepository) {
  return async (customerInternalId: string, raw: unknown) => {
    const parsed = recommendKeywordSchema.safeParse(raw)
    if (!parsed.success) {
      throw new BadRequestError(
        `Invalid data: ${parsed.error.issues.map((i) => i.message).join(', ')}`,
      )
    }
    return repo.create(customerInternalId, {
      ...parsed.data,
      note: normalizeNote(parsed.data.note),
      isTopReport: parsed.data.isTopReport ?? false,
      kd: parsed.data.kd ?? null,
    })
  }
}
