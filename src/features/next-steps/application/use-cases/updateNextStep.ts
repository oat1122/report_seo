import { MAX_NEXT_STEP_IMAGES, nextStepSchema, normalizeDescription } from '../../schemas'
import { BadRequestError, NotFoundError } from '@/lib/errors'
import type { NextStepRepository } from '../ports/NextStepRepository'
import type { ImageStorage } from '../ports/ImageStorage'

export function updateNextStepUseCase(repo: NextStepRepository, storage: ImageStorage) {
  return async (
    customerInternalId: string,
    stepId: string,
    raw: unknown,
    newFiles: File[],
    imageIdsToDelete: string[],
  ) => {
    const parsed = nextStepSchema.safeParse(raw)
    if (!parsed.success) {
      throw new BadRequestError(
        `Invalid data: ${parsed.error.issues.map((i) => i.message).join(', ')}`,
      )
    }

    const existing = await repo.findById(stepId, customerInternalId)
    if (!existing) throw new NotFoundError('Next step not found')

    const imagesToDelete = existing.images.filter((img) => imageIdsToDelete.includes(img.id))
    const remainingCount = existing.images.length - imagesToDelete.length
    if (remainingCount + newFiles.length > MAX_NEXT_STEP_IMAGES) {
      throw new BadRequestError(`อัปโหลดรูปภาพได้สูงสุด ${MAX_NEXT_STEP_IMAGES} รูป`)
    }

    const saved = newFiles.length > 0 ? await storage.validateAndWrite(newFiles) : []

    try {
      const result = await repo.applyUpdate(
        stepId,
        {
          title: parsed.data.title.trim(),
          priority: parsed.data.priority,
          description: normalizeDescription(parsed.data.description),
        },
        {
          imageIdsToRemove: imagesToDelete.map((img) => img.id),
          newImageUrls: saved.map((s) => s.url),
        },
      )

      // DB เรียบร้อย — ลบไฟล์เก่าที่ถูกถอดออก (พลาดที่นี่ไม่กระทบ DB)
      for (const image of imagesToDelete) {
        try {
          await storage.removeByUrl(image.imageUrl)
        } catch (err) {
          console.error('Failed to remove old image', err)
        }
      }

      return result
    } catch (error) {
      // DB ล้ม — rollback ไฟล์ที่เพิ่งเขียน
      await Promise.all(saved.map((s) => storage.removeByAbsolutePath(s.absolutePath)))
      throw error
    }
  }
}
