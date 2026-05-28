import { BadRequestError } from '@/lib/errors'
import { dashboardSummaryQuerySchema } from '../../../schemas'
import type { WorkProgressRepository, CustomerSummary } from '../../ports/WorkProgressRepository'
import type { WorkProgressActivityRepository } from '../../ports/WorkProgressActivityRepository'
import type { WorkProgressActivity } from '../../../domain/WorkProgressActivity'

export interface DashboardSummary extends CustomerSummary {
  recentActivity: WorkProgressActivity[]
}

export function getDashboardSummaryUseCase(
  repo: WorkProgressRepository,
  activityRepo: WorkProgressActivityRepository,
) {
  return async (customerId: string, raw: unknown): Promise<DashboardSummary> => {
    const parsed = dashboardSummaryQuerySchema.safeParse(raw)
    if (!parsed.success) {
      const detail = parsed.error.issues
        .map((i) => `${i.path.join('.') || '(root)'}: ${i.message}`)
        .join(', ')
      throw new BadRequestError(`Invalid summary query: ${detail}`)
    }
    const { upcomingDays, recentLimit } = parsed.data

    const [summary, recentActivity] = await Promise.all([
      repo.summarizeCustomer(customerId, { upcomingDays }),
      recentLimit > 0
        ? activityRepo.listRecentForCustomer(customerId, recentLimit)
        : Promise.resolve([] as WorkProgressActivity[]),
    ])

    return { ...summary, recentActivity }
  }
}
