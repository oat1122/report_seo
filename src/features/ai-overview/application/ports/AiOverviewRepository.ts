import type { AiOverview } from '../../domain/AiOverview'
import type { AiOverviewCreateInput, AiOverviewUpdateInput } from '../../schemas'

export interface AiOverviewRepository {
  findByCustomerId(customerInternalId: string): Promise<AiOverview[]>
  findById(id: string, customerInternalId: string): Promise<AiOverview | null>
  create(
    customerInternalId: string,
    input: AiOverviewCreateInput,
    imageUrls: string[],
  ): Promise<AiOverview>
  applyUpdate(
    id: string,
    input: AiOverviewUpdateInput,
    options: {
      imageIdsToRemove: string[]
      newImageUrls: string[]
      fallbackDisplayDate: Date
    },
  ): Promise<AiOverview>
  delete(id: string): Promise<void>
}
