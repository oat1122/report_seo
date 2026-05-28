import { NotFoundError } from '@/lib/errors'
import type { AiOverviewRepository } from '../ports/AiOverviewRepository'
import type { ImageStorage } from '../ports/ImageStorage'

export function deleteAiOverviewUseCase(repo: AiOverviewRepository, storage: ImageStorage) {
  return async (customerInternalId: string, id: string): Promise<{ id: string }> => {
    const existing = await repo.findById(id, customerInternalId)
    if (!existing) {
      throw new NotFoundError('ไม่พบข้อมูล AI Overview')
    }

    // DB เป็น source of truth — ลบก่อน ค่อย unlink ไฟล์
    // ถ้า unlink fail ไฟล์ leak ดีกว่า DB ไม่ตรง
    await repo.delete(id)

    for (const image of existing.images) {
      try {
        await storage.removeByUrl(image.imageUrl)
      } catch (err) {
        console.error('Failed to remove image on delete', err)
      }
    }

    return { id }
  }
}
