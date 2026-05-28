import type { DocumentTemplateRepository } from '../../ports/DocumentTemplateRepository'
import { NotFoundError } from '@/lib/errors'

export function deleteTemplateUseCase(repo: DocumentTemplateRepository) {
  return async (templateId: string) => {
    const existing = await repo.findById(templateId)
    if (!existing) throw new NotFoundError('ไม่พบ template')
    await repo.delete(templateId)
  }
}
