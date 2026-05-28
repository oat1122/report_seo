import { serializeAiOverview, type SerializedAiOverview } from '../../domain/AiOverview'
import type { AiOverviewRepository } from '../ports/AiOverviewRepository'

export function listAiOverviewsUseCase(repo: AiOverviewRepository) {
  return async (customerInternalId: string): Promise<SerializedAiOverview[]> => {
    const rows = await repo.findByCustomerId(customerInternalId)
    return rows.map(serializeAiOverview)
  }
}
