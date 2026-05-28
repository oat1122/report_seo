import { BadRequestError, ForbiddenError, NotFoundError } from '@/lib/errors'
import { addLinkAttachmentSchema } from '../../../schemas'
import type { WorkProgressRepository } from '../../ports/WorkProgressRepository'
import type { WorkProgressAttachmentRepository } from '../../ports/WorkProgressAttachmentRepository'
import type { WorkProgressActivityRepository } from '../../ports/WorkProgressActivityRepository'

export function addLinkAttachmentUseCase(
  repo: WorkProgressRepository,
  attachmentRepo: WorkProgressAttachmentRepository,
  activityRepo: WorkProgressActivityRepository,
) {
  return async (
    customerId: string,
    planId: string,
    itemId: string,
    uploadedById: string,
    raw: unknown,
  ) => {
    const parsed = addLinkAttachmentSchema.safeParse(raw)
    if (!parsed.success) {
      const detail = parsed.error.issues
        .map((i) => `${i.path.join('.') || '(root)'}: ${i.message}`)
        .join(', ')
      throw new BadRequestError(`Invalid link data: ${detail}`)
    }
    const { url, caption } = parsed.data

    const item = await repo.findItemById(itemId)
    if (!item) throw new NotFoundError('ไม่พบรายการ')
    if (item.planId !== planId) {
      throw new ForbiddenError('รายการไม่อยู่ในแผนงานที่ระบุ')
    }
    const plan = await repo.findById(planId)
    if (!plan || plan.customerId !== customerId) {
      throw new ForbiddenError('ไม่มีสิทธิ์แก้ไขแผนงานนี้')
    }

    const created = await attachmentRepo.create({
      itemId,
      kind: 'LINK',
      url,
      filename: null,
      mimeType: null,
      sizeBytes: null,
      caption: caption ?? null,
      uploadedById,
    })
    await activityRepo.log({
      planId,
      actorId: uploadedById,
      action: 'ATTACHMENT_LINKED',
      entity: 'ATTACHMENT',
      entityId: created.id,
      diff: { input: parsed.data, after: created, itemId },
    })
    return created
  }
}
