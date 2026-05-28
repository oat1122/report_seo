import { BadRequestError, ConflictError, NotFoundError } from '@/lib/errors'
import { reorderTemplateItemsSchema } from '../../../schemas'
import type { WorkProgressTemplateRepository } from '../../ports/WorkProgressTemplateRepository'

export function reorderTemplateItemsUseCase(templateRepo: WorkProgressTemplateRepository) {
  return async (templateId: string, raw: unknown) => {
    const parsed = reorderTemplateItemsSchema.safeParse(raw)
    if (!parsed.success) {
      const detail = parsed.error.issues
        .map((i) => `${i.path.join('.') || '(root)'}: ${i.message}`)
        .join(', ')
      throw new BadRequestError(`Invalid reorder data: ${detail}`)
    }

    const template = await templateRepo.findById(templateId)
    if (!template) throw new NotFoundError('ไม่พบ template')
    if (template.isSystem) {
      throw new ConflictError('ห้ามเรียงลำดับ items ของ system template')
    }

    const itemIdsInTemplate = new Set(template.items.map((it) => it.id))
    for (const entry of parsed.data.order) {
      if (!itemIdsInTemplate.has(entry.itemId)) {
        throw new BadRequestError(`itemId ${entry.itemId} ไม่อยู่ใน template นี้`)
      }
    }

    await templateRepo.reorderItems(templateId, parsed.data.order)
  }
}
