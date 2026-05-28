import { ForbiddenError, NotFoundError } from '@/lib/errors'
import type { WorkProgressRepository } from '../../ports/WorkProgressRepository'
import type { WorkProgressSubtaskRepository } from '../../ports/WorkProgressSubtaskRepository'
import type { WorkProgressActivityRepository } from '../../ports/WorkProgressActivityRepository'

export function deleteSubtaskUseCase(
  repo: WorkProgressRepository,
  subtaskRepo: WorkProgressSubtaskRepository,
  activityRepo: WorkProgressActivityRepository,
) {
  return async (
    customerId: string,
    planId: string,
    itemId: string,
    subtaskId: string,
    actorId: string | null,
  ) => {
    const subtask = await subtaskRepo.findById(subtaskId)
    if (!subtask) throw new NotFoundError('ไม่พบ subtask')
    if (subtask.itemId !== itemId) {
      throw new ForbiddenError('subtask ไม่อยู่ในรายการที่ระบุ')
    }
    const item = await repo.findItemById(itemId)
    if (!item || item.planId !== planId) {
      throw new ForbiddenError('รายการไม่อยู่ในแผนงานที่ระบุ')
    }
    const plan = await repo.findById(planId)
    if (!plan || plan.customerId !== customerId) {
      throw new ForbiddenError('ไม่มีสิทธิ์แก้ไขแผนงานนี้')
    }

    await subtaskRepo.delete(subtaskId)
    await activityRepo.log({
      planId,
      actorId,
      action: 'SUBTASK_DELETED',
      entity: 'SUBTASK',
      entityId: subtaskId,
      diff: { entity: subtask, itemId },
    })
  }
}
