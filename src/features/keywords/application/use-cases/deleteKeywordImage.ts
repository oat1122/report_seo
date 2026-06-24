import { NotFoundError } from '@/lib/errors'
import type { KeywordRepository } from '../ports/KeywordRepository'
import type { ImageStorage } from '../ports/ImageStorage'

export function deleteKeywordImageUseCase(repo: KeywordRepository, storage: ImageStorage) {
  return async (keywordId: string, imageId: string): Promise<{ id: string }> => {
    const image = await repo.findImage(keywordId, imageId)
    if (!image) {
      throw new NotFoundError('ไม่พบรูปหลักฐาน')
    }

    // DB เป็น source of truth — ลบก่อน ค่อย unlink ไฟล์
    await repo.deleteImage(imageId)

    try {
      await storage.removeByUrl(image.imageUrl)
    } catch (err) {
      console.error('Failed to remove keyword evidence image on delete', err)
    }

    return { id: imageId }
  }
}
