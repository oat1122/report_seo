import type {
  DocumentTemplateRepository,
  UpdateTemplateData,
} from '../../ports/DocumentTemplateRepository'
import { NotFoundError } from '@/lib/errors'

export function updateTemplateUseCase(repo: DocumentTemplateRepository) {
  return async (templateId: string, data: UpdateTemplateData) => {
    const existing = await repo.findById(templateId)
    if (!existing) throw new NotFoundError('ไม่พบ template')
    return repo.update(templateId, data)
  }
}
