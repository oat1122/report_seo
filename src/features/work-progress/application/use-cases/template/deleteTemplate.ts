import { ConflictError, NotFoundError } from '@/lib/errors'
import type { WorkProgressTemplateRepository } from '../../ports/WorkProgressTemplateRepository'

export function deleteTemplateUseCase(templateRepo: WorkProgressTemplateRepository) {
  return async (id: string) => {
    const existing = await templateRepo.findById(id)
    if (!existing) throw new NotFoundError('ไม่พบ template')
    if (existing.isSystem) {
      throw new ConflictError('ห้ามลบ system template')
    }
    await templateRepo.delete(id)
  }
}
