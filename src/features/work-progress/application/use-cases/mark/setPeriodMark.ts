import { BadRequestError, ForbiddenError, NotFoundError } from '@/lib/errors'
import { setPeriodMarkSchema } from '../../../schemas'
import type { WorkProgressRepository } from '../../ports/WorkProgressRepository'
import type { WorkProgressMasterRepository } from '../../ports/WorkProgressMasterRepository'
import type { WorkProgressActivityRepository } from '../../ports/WorkProgressActivityRepository'

export function setPeriodMarkUseCase(
  repo: WorkProgressRepository,
  masterRepo: WorkProgressMasterRepository,
  activityRepo: WorkProgressActivityRepository,
) {
  return async (
    customerId: string,
    planId: string,
    itemId: string,
    actorId: string | null,
    raw: unknown,
  ) => {
    const parsed = setPeriodMarkSchema.safeParse(raw)
    if (!parsed.success) {
      const detail = parsed.error.issues
        .map((i) => `${i.path.join('.') || '(root)'}: ${i.message}`)
        .join(', ')
      throw new BadRequestError(`Invalid mark data: ${detail}`)
    }
    const input = parsed.data

    const plan = await repo.findById(planId)
    if (!plan) throw new NotFoundError('ไม่พบแผนงาน')
    if (plan.customerId !== customerId) {
      throw new ForbiddenError('ไม่มีสิทธิ์แก้ไขแผนงานนี้')
    }

    // กัน cross-plan: ทั้ง item และ period ต้องอยู่ใน plan เดียวกัน
    const [itemInPlan, periodInPlan] = await Promise.all([
      repo.isItemInPlan(itemId, planId),
      repo.isPeriodInPlan(input.periodId, planId),
    ])
    if (!itemInPlan) throw new BadRequestError('รายการไม่อยู่ในแผนงานนี้')
    if (!periodInPlan) throw new BadRequestError('ช่วงเวลาไม่อยู่ในแผนงานนี้')

    const markType = await masterRepo.findMarkTypeById(input.markTypeId)
    if (!markType || !markType.isActive) {
      throw new BadRequestError('ประเภทเครื่องหมายไม่ถูกต้องหรือถูกปิดใช้งาน')
    }

    const mark = await repo.setPeriodMark({
      itemId,
      periodId: input.periodId,
      markTypeId: input.markTypeId,
      progressPercent: input.progressPercent ?? null,
      note: input.note ?? null,
    })
    await activityRepo.log({
      planId,
      actorId,
      action: 'MARK_SET',
      entity: 'MARK',
      entityId: mark.id,
      diff: { input, after: mark, itemId },
    })
    return mark
  }
}
