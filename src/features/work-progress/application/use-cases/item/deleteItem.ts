import { ForbiddenError, NotFoundError } from '@/lib/errors'
import type { WorkProgressRepository } from '../../ports/WorkProgressRepository'
import type { WorkProgressActivityRepository } from '../../ports/WorkProgressActivityRepository'

export function deleteItemUseCase(
  repo: WorkProgressRepository,
  activityRepo: WorkProgressActivityRepository,
) {
  return async (customerId: string, planId: string, itemId: string, actorId: string | null) => {
    const item = await repo.findItemById(itemId)
    if (!item) throw new NotFoundError('ไม่พบรายการ')
    if (item.planId !== planId) {
      throw new ForbiddenError('รายการไม่อยู่ในแผนงานที่ระบุ')
    }
    const plan = await repo.findById(planId)
    if (!plan || plan.customerId !== customerId) {
      throw new ForbiddenError('ไม่มีสิทธิ์ลบรายการนี้')
    }
    await repo.deleteItem(itemId)
    await activityRepo.log({
      planId,
      actorId,
      action: 'ITEM_DELETED',
      entity: 'ITEM',
      entityId: itemId,
      diff: { entity: item },
    })
  }
}
