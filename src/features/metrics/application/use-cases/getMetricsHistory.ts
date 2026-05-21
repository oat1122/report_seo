import type { MetricsRepository } from "../ports/MetricsRepository";

export function getMetricsHistoryUseCase(repo: MetricsRepository) {
  return (
    customerInternalId: string,
    options: { onlyVisible?: boolean } = {},
  ) =>
    repo.findHistory(customerInternalId, {
      onlyVisible: options.onlyVisible ?? false,
    });
}
