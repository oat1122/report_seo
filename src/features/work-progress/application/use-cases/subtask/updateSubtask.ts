import { BadRequestError, ForbiddenError, NotFoundError } from '@/lib/errors'
import { updateSubtaskSchema } from '../../../schemas'
import type { WorkProgressRepository } from '../../ports/WorkProgressRepository'
import type {
  UpdateSubtaskData,
  WorkProgressSubtaskRepository,
} from '../../ports/WorkProgressSubtaskRepository'
import { assertAssigneeAllowed, type AssigneeLookup } from '../../policies/assignee-guard'
import type { WorkProgressActivityRepository } from '../../ports/WorkProgressActivityRepository'

export function updateSubtaskUseCase(
  repo: WorkProgressRepository,
  subtaskRepo: WorkProgressSubtaskRepository,
  lookupAssignee: AssigneeLookup,
  activityRepo: WorkProgressActivityRepository,
) {
  return async (
    customerId: string,
    planId: string,
    itemId: string,
    subtaskId: string,
    customerSeoDevId: string | null,
    actorId: string | null,
    raw: unknown,
  ) => {
    const parsed = updateSubtaskSchema.safeParse(raw)
    if (!parsed.success) {
      const detail = parsed.error.issues
        .map((i) => `${i.path.join('.') || '(root)'}: ${i.message}`)
        .join(', ')
      throw new BadRequestError(`Invalid subtask update: ${detail}`)
    }
    const input = parsed.data

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

    if (input.assignedToId !== undefined && input.assignedToId !== null) {
      await assertAssigneeAllowed(input.assignedToId, customerSeoDevId, lookupAssignee)
    }

    const patch: UpdateSubtaskData = {}
    if (input.title !== undefined) patch.title = input.title
    if (input.assignedToId !== undefined) patch.assignedToId = input.assignedToId
    if (input.isDone !== undefined) {
      patch.isDone = input.isDone
      // sync completedAt อัตโนมัติ
      if (input.isDone && subtask.completedAt === null) {
        patch.completedAt = new Date()
      } else if (!input.isDone && subtask.completedAt !== null) {
        patch.completedAt = null
      }
    }

    const updated = await subtaskRepo.update(subtaskId, patch)
    await activityRepo.log({
      planId,
      actorId,
      action: 'SUBTASK_UPDATED',
      entity: 'SUBTASK',
      entityId: subtaskId,
      diff: { input, patch, after: updated, itemId },
    })
    return updated
  }
}
