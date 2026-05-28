import { BadRequestError, ForbiddenError, NotFoundError } from '@/lib/errors'
import { bulkUpdateItemStatusSchema } from '../../../schemas'
import type { WorkProgressRepository } from '../../ports/WorkProgressRepository'
import type { WorkProgressMasterRepository } from '../../ports/WorkProgressMasterRepository'
import type { WorkProgressActivityRepository } from '../../ports/WorkProgressActivityRepository'

export function bulkUpdateItemStatusUseCase(
  repo: WorkProgressRepository,
  masterRepo: WorkProgressMasterRepository,
  activityRepo: WorkProgressActivityRepository,
) {
  return async (customerId: string, planId: string, actorId: string | null, raw: unknown) => {
    const parsed = bulkUpdateItemStatusSchema.safeParse(raw)
    if (!parsed.success) {
      const detail = parsed.error.issues
        .map((i) => `${i.path.join('.') || '(root)'}: ${i.message}`)
        .join(', ')
      throw new BadRequestError(`Invalid bulk status data: ${detail}`)
    }
    const { itemIds, statusId } = parsed.data

    const plan = await repo.findById(planId)
    if (!plan) throw new NotFoundError('ไม่พบแผนงาน')
    if (plan.customerId !== customerId) {
      throw new ForbiddenError('ไม่มีสิทธิ์แก้ไขแผนงานนี้')
    }

    const status = await masterRepo.findStatusById(statusId)
    if (!status || !status.isActive) {
      throw new BadRequestError('สถานะไม่ถูกต้องหรือถูกปิดใช้งาน')
    }

    const matched = await repo.countItemsInPlan(planId, itemIds)
    if (matched !== itemIds.length) {
      throw new BadRequestError('มีรายการที่ไม่อยู่ในแผนงานนี้')
    }

    const completedAt = status.isTerminal ? new Date() : null
    const result = await repo.bulkUpdateItemStatus(planId, itemIds, statusId, completedAt)

    await activityRepo.log({
      planId,
      actorId,
      action: 'ITEM_STATUS_BULK_UPDATED',
      entity: 'ITEM',
      entityId: null,
      diff: { input: { itemIds, statusId }, after: result },
    })
    return result
  }
}
