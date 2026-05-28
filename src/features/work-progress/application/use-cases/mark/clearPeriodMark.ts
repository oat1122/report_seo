import { BadRequestError, ForbiddenError, NotFoundError } from '@/lib/errors'
import type { WorkProgressRepository } from '../../ports/WorkProgressRepository'
import type { WorkProgressActivityRepository } from '../../ports/WorkProgressActivityRepository'

export function clearPeriodMarkUseCase(
  repo: WorkProgressRepository,
  activityRepo: WorkProgressActivityRepository,
) {
  return async (
    customerId: string,
    planId: string,
    itemId: string,
    periodId: string,
    actorId: string | null,
  ) => {
    const plan = await repo.findById(planId)
    if (!plan) throw new NotFoundError('ไม่พบแผนงาน')
    if (plan.customerId !== customerId) {
      throw new ForbiddenError('ไม่มีสิทธิ์แก้ไขแผนงานนี้')
    }
    const [itemInPlan, periodInPlan] = await Promise.all([
      repo.isItemInPlan(itemId, planId),
      repo.isPeriodInPlan(periodId, planId),
    ])
    if (!itemInPlan) throw new BadRequestError('รายการไม่อยู่ในแผนงานนี้')
    if (!periodInPlan) throw new BadRequestError('ช่วงเวลาไม่อยู่ในแผนงานนี้')
    await repo.clearPeriodMark(itemId, periodId)
    await activityRepo.log({
      planId,
      actorId,
      action: 'MARK_CLEARED',
      entity: 'MARK',
      entityId: null,
      diff: { itemId, periodId },
    })
  }
}
