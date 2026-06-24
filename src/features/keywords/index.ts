import { PrismaKeywordRepository } from './infrastructure/PrismaKeywordRepository'
import { LocalKeywordEvidenceStorage } from './infrastructure/LocalKeywordEvidenceStorage'
import { getKeywordsUseCase } from './application/use-cases/getKeywords'
import { addKeywordUseCase } from './application/use-cases/addKeyword'
import { updateKeywordUseCase } from './application/use-cases/updateKeyword'
import { deleteKeywordUseCase } from './application/use-cases/deleteKeyword'
import { addKeywordImagesUseCase } from './application/use-cases/addKeywordImages'
import { deleteKeywordImageUseCase } from './application/use-cases/deleteKeywordImage'
import {
  getKeywordHistoryUseCase,
  getKeywordHistoryByCustomerUseCase,
} from './application/use-cases/getKeywordHistory'
import {
  setKeywordHistoryVisibilityUseCase,
  bulkSetKeywordHistoryVisibilityUseCase,
} from './application/use-cases/setKeywordHistoryVisibility'

const repo = new PrismaKeywordRepository()
const evidenceStorage = new LocalKeywordEvidenceStorage()

export const getKeywords = getKeywordsUseCase(repo)
export const addKeyword = addKeywordUseCase(repo)
export const updateKeyword = updateKeywordUseCase(repo)
export const deleteKeyword = deleteKeywordUseCase(repo)
export const addKeywordImages = addKeywordImagesUseCase(repo, evidenceStorage)
export const deleteKeywordImage = deleteKeywordImageUseCase(repo, evidenceStorage)
export const getKeywordHistory = getKeywordHistoryUseCase(repo)
export const getKeywordHistoryByCustomer = getKeywordHistoryByCustomerUseCase(repo)
export const setKeywordHistoryVisibility = setKeywordHistoryVisibilityUseCase(repo)
export const bulkSetKeywordHistoryVisibility = bulkSetKeywordHistoryVisibilityUseCase(repo)

export {
  keywordSchema,
  historyVisibilitySchema,
  MAX_KEYWORD_EVIDENCE_IMAGES,
  type KeywordInput,
  type HistoryVisibilityInput,
} from './schemas'
export type { KeywordReport, KeywordHistoryEntry, KeywordReportImage } from './domain/KeywordReport'
