import { existsSync } from 'fs'
import { mkdir, unlink, writeFile } from 'fs/promises'
import path from 'path'
import { validateUploadFile } from '@/infrastructure/upload/validators'
import { buildPublicUrl, getUploadDir, resolveUploadPath } from '@/lib/upload-paths'
import { BadRequestError } from '@/lib/errors'
import { logger } from '@/lib/logger'
import type { BlogFileKind } from '../domain/BlogArticle'
import type { BlogFileStorage, SavedBlogFile } from '../application/ports/BlogFileStorage'

const UPLOAD_CATEGORY = 'blog-plan' as const
const UPLOAD_DIR = getUploadDir(UPLOAD_CATEGORY)

// ไฟล์ Word ที่มีรูปฝังมักเกิน default 5MB — ภาพปกยังใช้ลิมิตเดิม
const LIMITS: Record<BlogFileKind, { kinds: readonly ['IMAGE'] | readonly ['FILE']; max: number }> =
  {
    COVER_IMAGE: { kinds: ['IMAGE'], max: 5 * 1024 * 1024 },
    ARTICLE_DOC: { kinds: ['FILE'], max: 20 * 1024 * 1024 },
  }

export class LocalBlogFileStorage implements BlogFileStorage {
  async validateAndWrite(file: File, kind: BlogFileKind): Promise<SavedBlogFile> {
    const limit = LIMITS[kind]
    const result = await validateUploadFile(file, {
      allowedKinds: limit.kinds,
      maxSizeBytes: limit.max,
    })
    if (!result.isValid || !result.validatedFile) {
      throw new BadRequestError(result.error || 'ไฟล์ไม่ผ่านการตรวจสอบ')
    }

    if (!existsSync(UPLOAD_DIR)) {
      await mkdir(UPLOAD_DIR, { recursive: true })
    }

    const absolutePath = path.join(UPLOAD_DIR, result.validatedFile.filename)
    await writeFile(absolutePath, result.validatedFile.buffer)

    return {
      url: buildPublicUrl(UPLOAD_CATEGORY, result.validatedFile.filename),
      absolutePath,
      filename: result.validatedFile.filename,
      mimeType: result.validatedFile.mimeType,
      sizeBytes: result.validatedFile.size,
    }
  }

  async removeByPublicUrl(url: string): Promise<void> {
    try {
      await this.removeByAbsolutePath(resolveUploadPath(url, UPLOAD_CATEGORY))
    } catch (err) {
      logger.warn({ err, url }, 'failed to resolve blog file path for cleanup')
    }
  }

  async removeByAbsolutePath(absolutePath: string): Promise<void> {
    try {
      if (existsSync(absolutePath)) {
        await unlink(absolutePath)
      }
    } catch (err) {
      logger.warn({ err, absolutePath }, 'failed to cleanup blog file')
    }
  }
}
