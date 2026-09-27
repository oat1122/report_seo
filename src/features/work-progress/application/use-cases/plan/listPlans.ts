import { listPlansQuerySchema } from '../../../schemas'
import {
  calcPlanOverallPercent,
  isItemCompleted,
} from '../../../domain/policies/progress-calculator'
import type { WorkProgressPlanListItem } from '../../../domain/WorkProgressPlan'
import type { WorkProgressRepository } from '../../ports/WorkProgressRepository'

export function listPlansUseCase(repo: WorkProgressRepository) {
  return async (customerId: string, raw: unknown = {}): Promise<WorkProgressPlanListItem[]> => {
    const query = listPlansQuerySchema.parse(raw ?? {})
    const plans = await repo.listByCustomer(customerId, {
      includeArchived: query.includeArchived,
      limit: query.limit,
    })
    return plans.map(({ items, ...plan }) => ({
      ...plan,
      progress: {
        overall: calcPlanOverallPercent(items),
        total: items.length,
        completed: items.filter(isItemCompleted).length,
      },
    }))
  }
}
