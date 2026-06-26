import { NotFoundError } from '@/lib/errors'
import type { NextStepRepository } from '../ports/NextStepRepository'
import type { ImageStorage } from '../ports/ImageStorage'

export function deleteNextStepUseCase(repo: NextStepRepository, storage: ImageStorage) {
  return async (customerInternalId: string, stepId: string) => {
    const existing = await repo.findById(stepId, customerInternalId)
    if (!existing) throw new NotFoundError('Next step not found')

    // DB เป็น source of truth — ลบก่อน (image rows cascade) ค่อย unlink ไฟล์
    await repo.delete(stepId)

    for (const image of existing.images) {
      try {
        await storage.removeByUrl(image.imageUrl)
      } catch (err) {
        console.error('Failed to remove image on delete', err)
      }
    }
  }
}
