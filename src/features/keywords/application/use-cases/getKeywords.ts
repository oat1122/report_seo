import type { KeywordRepository } from '../ports/KeywordRepository'

export function getKeywordsUseCase(repo: KeywordRepository) {
  return (customerInternalId: string) => repo.findByCustomerId(customerInternalId)
}
