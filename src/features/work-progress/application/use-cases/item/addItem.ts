import { BadRequestError, ForbiddenError, NotFoundError } from '@/lib/errors'
import { addItemSchema } from '../../../schemas'
import type { WorkProgressRepository } from '../../ports/WorkProgressRepository'
import type { WorkProgressMasterRepository } from '../../ports/WorkProgressMasterRepository'
import type { WorkProgressActivityRepository } from '../../ports/WorkProgressActivityRepository'

export function addItemUseCase(
  repo: WorkProgressRepository,
  masterRepo: WorkProgressMasterRepository,
  activityRepo: WorkProgressActivityRepository,
) {
  return async (customerId: string, planId: string, actorId: string | null, raw: unknown) => {
    const parsed = addItemSchema.safeParse(raw)
    if (!parsed.success) {
      const detail = parsed.error.issues
        .map((i) => `${i.path.join('.') || '(root)'}: ${i.message}`)
        .join(', ')
      throw new BadRequestError(`Invalid item data: ${detail}`)
    }
    const input = parsed.data

    const plan = await repo.findById(planId)
    if (!plan) throw new NotFoundError('ไม่พบแผนงาน')
    if (plan.customerId !== customerId) {
      throw new ForbiddenError('ไม่มีสิทธิ์แก้ไขแผนงานนี้')
    }

    // Validate category อยู่และยัง active
    const category = await masterRepo.findCategoryById(input.categoryId)
    if (!category || !category.isActive) {
      throw new BadRequestError('หมวดหมู่ไม่ถูกต้องหรือถูกปิดใช้งาน')
    }

    // ถ้า client ไม่ส่ง statusId → ใส่ default status
    let statusId = input.statusId
    if (!statusId) {
      const defaultStatus = await masterRepo.findDefaultStatus()
      if (!defaultStatus) {
        throw new BadRequestError(
          'ระบบยังไม่มี default status — แอดมินต้องตั้ง isDefault=true ให้ status อย่างน้อย 1 ตัว',
        )
      }
      statusId = defaultStatus.id
    } else {
      const status = await masterRepo.findStatusById(statusId)
      if (!status || !status.isActive) {
        throw new BadRequestError('สถานะไม่ถูกต้องหรือถูกปิดใช้งาน')
      }
    }

    const created = await repo.addItem({
      planId,
      categoryId: input.categoryId,
      statusId,
      activity: input.activity,
      description: input.description ?? null,
      duration: input.duration ?? null,
      note: input.note ?? null,
      weight: input.weight,
      orderIndex: input.orderIndex ?? null,
      startDate: input.startDate ?? null,
      dueDate: input.dueDate ?? null,
    })
    await activityRepo.log({
      planId,
      actorId,
      action: 'ITEM_CREATED',
      entity: 'ITEM',
      entityId: created.id,
      diff: { input, after: created },
    })
    return created
  }
}
