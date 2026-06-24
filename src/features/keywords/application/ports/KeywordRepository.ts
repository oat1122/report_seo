import type {
  KeywordReport,
  KeywordHistoryEntry,
  KeywordReportImage,
} from '../../domain/KeywordReport'
import type { KeywordInput } from '../../schemas'

export interface KeywordRepository {
  findByCustomerId(customerInternalId: string): Promise<KeywordReport[]>
  create(customerInternalId: string, data: KeywordInput): Promise<KeywordReport>
  update(keywordId: string, data: KeywordInput): Promise<KeywordReport>
  delete(keywordId: string): Promise<void>
  countImages(keywordId: string): Promise<number>
  addImages(keywordId: string, imageUrls: string[]): Promise<KeywordReportImage[]>
  findImage(keywordId: string, imageId: string): Promise<KeywordReportImage | null>
  deleteImage(imageId: string): Promise<void>
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
