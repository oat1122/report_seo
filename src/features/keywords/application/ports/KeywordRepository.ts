import type { KeywordReport, KeywordHistoryEntry } from '../../domain/KeywordReport'
import type { KeywordInput } from '../../schemas'

export interface KeywordRepository {
  findByCustomerId(customerInternalId: string): Promise<KeywordReport[]>
  create(customerInternalId: string, data: KeywordInput): Promise<KeywordReport>
  update(keywordId: string, data: KeywordInput): Promise<KeywordReport>
  delete(keywordId: string): Promise<void>
  findHistoryByKeywordId(
    keywordId: string,
    options: { onlyVisible: boolean },
  ): Promise<KeywordHistoryEntry[]>
  findHistoryByCustomerId(
    customerInternalId: string,
    options: { onlyVisible: boolean },
  ): Promise<KeywordHistoryEntry[]>
  setHistoryVisibility(
    historyId: string,
    isVisible: boolean,
    customerInternalId: string,
  ): Promise<{ updated: number }>
  setHistoryVisibilityBulk(
    historyIds: string[],
    isVisible: boolean,
    customerInternalId: string,
  ): Promise<{ updated: number }>
}
