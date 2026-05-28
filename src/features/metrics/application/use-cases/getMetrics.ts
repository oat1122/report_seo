import type { MetricsRepository } from '../ports/MetricsRepository'

export function getMetricsUseCase(repo: MetricsRepository) {
  return (customerInternalId: string) => repo.findByCustomerId(customerInternalId)
}
