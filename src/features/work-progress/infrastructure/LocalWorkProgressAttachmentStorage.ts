import { existsSync } from 'fs'
import { mkdir, unlink, writeFile } from 'fs/promises'
import path from 'path'
import { validateUploadFile } from '@/infrastructure/upload/validators'
import { buildPublicUrl, getUploadDir } from '@/lib/upload-paths'
import { BadRequestError } from '@/lib/errors'
import { logger } from '@/lib/logger'
import type { AttachmentStorage, SavedAttachment } from '../application/ports/AttachmentStorage'

const UPLOAD_CATEGORY = 'work-progress' as const
const UPLOAD_DIR = getUploadDir(UPLOAD_CATEGORY)

export class LocalWorkProgressAttachmentStorage implements AttachmentStorage {
  async validateAndWrite(file: File): Promise<SavedAttachment> {
    const result = await validateUploadFile(file, {
      allowedKinds: ['IMAGE', 'FILE'],
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

  async removeByAbsolutePath(absolutePath: string): Promise<void> {
    try {
      if (existsSync(absolutePath)) {
        await unlink(absolutePath)
      }
    } catch (err) {
      logger.warn({ err, absolutePath }, 'failed to cleanup work-progress attachment file')
    }
  }
}
