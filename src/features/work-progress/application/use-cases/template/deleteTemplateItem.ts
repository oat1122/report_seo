import { BadRequestError, ConflictError, NotFoundError } from '@/lib/errors'
import type { WorkProgressTemplateRepository } from '../../ports/WorkProgressTemplateRepository'

export function deleteTemplateItemUseCase(templateRepo: WorkProgressTemplateRepository) {
  return async (templateId: string, itemId: string) => {
    const existing = await templateRepo.findItemById(itemId)
    if (!existing) throw new NotFoundError('ไม่พบ template item')
    if (existing.templateId !== templateId) {
      throw new BadRequestError('item ไม่อยู่ใน template นี้')
    }
    if (existing.template.isSystem) {
      throw new ConflictError('ห้ามลบ items ของ system template')
    }
    await templateRepo.deleteItem(itemId)
  }
}
