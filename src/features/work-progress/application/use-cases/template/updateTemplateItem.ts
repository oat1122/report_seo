import { BadRequestError, ConflictError, NotFoundError } from '@/lib/errors'
import { updateTemplateItemSchema } from '../../../schemas'
import type { WorkProgressMasterRepository } from '../../ports/WorkProgressMasterRepository'
import type { WorkProgressTemplateRepository } from '../../ports/WorkProgressTemplateRepository'

export function updateTemplateItemUseCase(
  templateRepo: WorkProgressTemplateRepository,
  masterRepo: WorkProgressMasterRepository,
) {
  return async (templateId: string, itemId: string, raw: unknown) => {
    const parsed = updateTemplateItemSchema.safeParse(raw)
    if (!parsed.success) {
      const detail = parsed.error.issues
        .map((i) => `${i.path.join('.') || '(root)'}: ${i.message}`)
        .join(', ')
      throw new BadRequestError(`Invalid update data: ${detail}`)
    }
    const input = parsed.data

    const existing = await templateRepo.findItemById(itemId)
    if (!existing) throw new NotFoundError('ไม่พบ template item')
    if (existing.templateId !== templateId) {
      throw new BadRequestError('item ไม่อยู่ใน template นี้')
    }
    if (existing.template.isSystem) {
      throw new ConflictError('ห้ามแก้ items ของ system template')
    }

    if (input.categoryId) {
      const category = await masterRepo.findCategoryById(input.categoryId)
      if (!category || !category.isActive) {
        throw new BadRequestError('หมวดหมู่ไม่ถูกต้องหรือถูกปิดใช้งาน')
      }
    }

    const { subtasks, ...itemUpdate } = input
    const updated = await templateRepo.updateItem(itemId, itemUpdate)
    if (subtasks) {
      await templateRepo.replaceItemSubtasks(itemId, subtasks)
    }
    return updated
  }
}
