import { BadRequestError } from '@/lib/errors'
import { MAX_KEYWORD_EVIDENCE_IMAGES } from '../../schemas'
import type { KeywordReportImage } from '../../domain/KeywordReport'
import type { KeywordRepository } from '../ports/KeywordRepository'
import type { ImageStorage } from '../ports/ImageStorage'

export function addKeywordImagesUseCase(repo: KeywordRepository, storage: ImageStorage) {
  return async (keywordId: string, files: File[]): Promise<KeywordReportImage[]> => {
    if (files.length === 0) {
      throw new BadRequestError('กรุณาเลือกรูปอย่างน้อย 1 รูป')
    }

    const existingCount = await repo.countImages(keywordId)
    if (existingCount + files.length > MAX_KEYWORD_EVIDENCE_IMAGES) {
      throw new BadRequestError(
        `อัปโหลดรูปหลักฐานได้สูงสุด ${MAX_KEYWORD_EVIDENCE_IMAGES} รูปต่อ keyword`,
      )
    }

    const saved = await storage.validateAndWrite(files)

    try {
      return await repo.addImages(
        keywordId,
        saved.map((s) => s.url),
      )
    } catch (error) {
      // DB ล้มเหลว — clean up ไฟล์ที่เพิ่งเขียนใหม่
      await Promise.all(saved.map((s) => storage.removeByAbsolutePath(s.absolutePath)))
      throw error
    }
  }
}
