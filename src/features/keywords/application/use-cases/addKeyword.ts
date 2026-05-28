import { keywordSchema } from '../../schemas'
import { BadRequestError } from '@/lib/errors'
import type { KeywordRepository } from '../ports/KeywordRepository'

export function addKeywordUseCase(repo: KeywordRepository) {
  return async (customerInternalId: string, raw: unknown) => {
    const parsed = keywordSchema.safeParse(raw)
    if (!parsed.success) {
      throw new BadRequestError(
        `Invalid data: ${parsed.error.issues.map((i) => i.message).join(', ')}`,
      )
    }
    return repo.create(customerInternalId, parsed.data)
  }
}
