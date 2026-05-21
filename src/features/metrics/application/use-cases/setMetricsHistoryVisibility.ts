import type { MetricsRepository } from "../ports/MetricsRepository";

export function setMetricsHistoryVisibilityUseCase(repo: MetricsRepository) {
  return (
    historyId: string,
    isVisible: boolean,
    customerInternalId: string,
  ) => repo.setVisibility(historyId, isVisible, customerInternalId);
}

export function bulkSetMetricsHistoryVisibilityUseCase(
  repo: MetricsRepository,
) {
  return (
    historyIds: string[],
    isVisible: boolean,
    customerInternalId: string,
  ) => repo.setVisibilityBulk(historyIds, isVisible, customerInternalId);
}
