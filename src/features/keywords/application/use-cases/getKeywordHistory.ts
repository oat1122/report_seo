import type { KeywordRepository } from '../ports/KeywordRepository'

export function getKeywordHistoryUseCase(repo: KeywordRepository) {
  return (keywordId: string, options: { onlyVisible?: boolean } = {}) =>
    repo.findHistoryByKeywordId(keywordId, {
      onlyVisible: options.onlyVisible ?? false,
    })
}

export function getKeywordHistoryByCustomerUseCase(repo: KeywordRepository) {
  return (customerInternalId: string, options: { onlyVisible?: boolean } = {}) =>
    repo.findHistoryByCustomerId(customerInternalId, {
      onlyVisible: options.onlyVisible ?? false,
    })
}
