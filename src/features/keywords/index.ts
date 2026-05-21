import { PrismaKeywordRepository } from "./infrastructure/PrismaKeywordRepository";
import { getKeywordsUseCase } from "./application/use-cases/getKeywords";
import { addKeywordUseCase } from "./application/use-cases/addKeyword";
import { updateKeywordUseCase } from "./application/use-cases/updateKeyword";
import { deleteKeywordUseCase } from "./application/use-cases/deleteKeyword";
import {
  getKeywordHistoryUseCase,
  getKeywordHistoryByCustomerUseCase,
} from "./application/use-cases/getKeywordHistory";
import {
  setKeywordHistoryVisibilityUseCase,
  bulkSetKeywordHistoryVisibilityUseCase,
} from "./application/use-cases/setKeywordHistoryVisibility";

const repo = new PrismaKeywordRepository();

export const getKeywords = getKeywordsUseCase(repo);
export const addKeyword = addKeywordUseCase(repo);
export const updateKeyword = updateKeywordUseCase(repo);
export const deleteKeyword = deleteKeywordUseCase(repo);
export const getKeywordHistory = getKeywordHistoryUseCase(repo);
export const getKeywordHistoryByCustomer =
  getKeywordHistoryByCustomerUseCase(repo);
export const setKeywordHistoryVisibility =
  setKeywordHistoryVisibilityUseCase(repo);
export const bulkSetKeywordHistoryVisibility =
  bulkSetKeywordHistoryVisibilityUseCase(repo);

export {
  keywordSchema,
  historyVisibilitySchema,
  type KeywordInput,
  type HistoryVisibilityInput,
} from "./schemas";
export type {
  KeywordReport,
  KeywordHistoryEntry,
} from "./domain/KeywordReport";
