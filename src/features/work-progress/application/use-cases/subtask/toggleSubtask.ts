import { ForbiddenError, NotFoundError } from '@/lib/errors'
import type { WorkProgressRepository } from '../../ports/WorkProgressRepository'
import type { WorkProgressSubtaskRepository } from '../../ports/WorkProgressSubtaskRepository'
import type { WorkProgressActivityRepository } from '../../ports/WorkProgressActivityRepository'

// Toggle isDone ของ subtask + sync completedAt อัตโนมัติ
// ไม่ต้องส่ง body — ใช้ค่าตรงข้ามจาก state ปัจจุบัน
export function toggleSubtaskUseCase(
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

    const nextDone = !subtask.isDone
    const updated = await subtaskRepo.update(subtaskId, {
      isDone: nextDone,
      completedAt: nextDone ? new Date() : null,
    })
    await activityRepo.log({
      planId,
      actorId,
      action: 'SUBTASK_TOGGLED',
      entity: 'SUBTASK',
      entityId: subtaskId,
      diff: { from: subtask.isDone, to: nextDone, after: updated, itemId },
    })
    return updated
  }
}
