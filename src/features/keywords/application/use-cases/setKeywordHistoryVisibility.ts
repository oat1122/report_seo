import type { KeywordRepository } from "../ports/KeywordRepository";

export function setKeywordHistoryVisibilityUseCase(repo: KeywordRepository) {
  return (
    historyId: string,
    isVisible: boolean,
    customerInternalId: string,
  ) => repo.setHistoryVisibility(historyId, isVisible, customerInternalId);
}

export function bulkSetKeywordHistoryVisibilityUseCase(
  repo: KeywordRepository,
) {
  return (
    historyIds: string[],
    isVisible: boolean,
    customerInternalId: string,
  ) =>
    repo.setHistoryVisibilityBulk(historyIds, isVisible, customerInternalId);
}
