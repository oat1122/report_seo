import { BadRequestError, ForbiddenError, NotFoundError } from '@/lib/errors'
import { addSubtaskSchema } from '../../../schemas'
import type { WorkProgressRepository } from '../../ports/WorkProgressRepository'
import type { WorkProgressSubtaskRepository } from '../../ports/WorkProgressSubtaskRepository'
import { assertAssigneeAllowed, type AssigneeLookup } from '../../policies/assignee-guard'
import type { WorkProgressActivityRepository } from '../../ports/WorkProgressActivityRepository'

export function addSubtaskUseCase(
  repo: WorkProgressRepository,
  subtaskRepo: WorkProgressSubtaskRepository,
  lookupAssignee: AssigneeLookup,
  activityRepo: WorkProgressActivityRepository,
) {
  return async (
    customerId: string,
    planId: string,
    itemId: string,
    customerSeoDevId: string | null,
    actorId: string | null,
    raw: unknown,
  ) => {
    const parsed = addSubtaskSchema.safeParse(raw)
    if (!parsed.success) {
      const detail = parsed.error.issues
        .map((i) => `${i.path.join('.') || '(root)'}: ${i.message}`)
        .join(', ')
      throw new BadRequestError(`Invalid subtask data: ${detail}`)
    }
    const input = parsed.data

    const item = await repo.findItemById(itemId)
    if (!item) throw new NotFoundError('ไม่พบรายการ')
    if (item.planId !== planId) {
      throw new ForbiddenError('รายการไม่อยู่ในแผนงานที่ระบุ')
    }
    const plan = await repo.findById(planId)
    if (!plan || plan.customerId !== customerId) {
      throw new ForbiddenError('ไม่มีสิทธิ์แก้ไขแผนงานนี้')
    }

    const assignedToId = input.assignedToId ?? null
    if (assignedToId !== null) {
      await assertAssigneeAllowed(assignedToId, customerSeoDevId, lookupAssignee)
    }

    const created = await subtaskRepo.add({
      itemId,
      title: input.title,
      assignedToId,
      orderIndex: input.orderIndex ?? null,
    })
    await activityRepo.log({
      planId,
      actorId,
      action: 'SUBTASK_CREATED',
      entity: 'SUBTASK',
      entityId: created.id,
      diff: { input, after: created, itemId },
    })
    return created
  }
}
