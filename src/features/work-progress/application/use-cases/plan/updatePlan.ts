import { ForbiddenError, NotFoundError } from '@/lib/errors'
import { generateMonthRangePeriods } from '../../../domain/policies/period-generator'
import type { WorkProgressRepository, UpdatePlanData } from '../../ports/WorkProgressRepository'
import type { WorkProgressActivityRepository } from '../../ports/WorkProgressActivityRepository'
import type { UpdatePlanInput } from '../../../schemas'

export function updatePlanUseCase(
  repo: WorkProgressRepository,
  activityRepo: WorkProgressActivityRepository,
) {
  return async (
    customerId: string,
    planId: string,
    actorId: string | null,
    input: UpdatePlanInput,
  ) => {
    const plan = await repo.findById(planId)
    if (!plan) throw new NotFoundError('ไม่พบแผนงาน')
    if (plan.customerId !== customerId) {
      throw new ForbiddenError('ไม่มีสิทธิ์แก้ไขแผนงานนี้')
    }

    const hasRange =
      input.startMonth !== undefined &&
      input.startYear !== undefined &&
      input.endMonth !== undefined &&
      input.endYear !== undefined

    const data: UpdatePlanData = {}
    if (input.title !== undefined) data.title = input.title
    if (input.packageName !== undefined) data.packageName = input.packageName
    if (input.note !== undefined) data.note = input.note

    if (hasRange) {
      const periods = generateMonthRangePeriods({
        startMonth: input.startMonth!,
        startYear: input.startYear!,
        endMonth: input.endMonth!,
        endYear: input.endYear!,
      })
      data.year = input.startYear!
      data.startDate = periods[0]?.startDate ?? null
      data.endDate = periods[periods.length - 1]?.endDate ?? null
      await repo.replacePeriods(planId, periods)
    }

    const updated = await repo.updatePlan(planId, data)
    await activityRepo.log({
      planId,
      actorId,
      action: 'PLAN_UPDATED',
      entity: 'PLAN',
      entityId: planId,
      diff: {
        before: {
          title: plan.title,
          packageName: plan.packageName,
          note: plan.note,
          startDate: plan.startDate,
          endDate: plan.endDate,
        },
        after: {
          title: updated.title,
          packageName: updated.packageName,
          note: updated.note,
          startDate: updated.startDate,
          endDate: updated.endDate,
        },
      },
    })
    return updated
  }
}
