import { MAX_NEXT_STEP_IMAGES, nextStepSchema, normalizeDescription } from '../../schemas'
import { BadRequestError } from '@/lib/errors'
import type { NextStepRepository } from '../ports/NextStepRepository'
import type { ImageStorage } from '../ports/ImageStorage'

export function addNextStepUseCase(repo: NextStepRepository, storage: ImageStorage) {
  return async (customerInternalId: string, raw: unknown, files: File[]) => {
    const parsed = nextStepSchema.safeParse(raw)
    if (!parsed.success) {
      throw new BadRequestError(
        `Invalid data: ${parsed.error.issues.map((i) => i.message).join(', ')}`,
      )
    }
    if (files.length > MAX_NEXT_STEP_IMAGES) {
      throw new BadRequestError(`อัปโหลดรูปภาพได้สูงสุด ${MAX_NEXT_STEP_IMAGES} รูป`)
    }

    const saved = files.length > 0 ? await storage.validateAndWrite(files) : []

    try {
      return await repo.create(
        customerInternalId,
        {
          title: parsed.data.title.trim(),
          priority: parsed.data.priority,
          description: normalizeDescription(parsed.data.description),
        },
        saved.map((s) => s.url),
      )
    } catch (error) {
      // DB ล้ม — rollback ไฟล์ที่เพิ่งเขียน
      await Promise.all(saved.map((s) => storage.removeByAbsolutePath(s.absolutePath)))
      throw error
    }
  }
}
