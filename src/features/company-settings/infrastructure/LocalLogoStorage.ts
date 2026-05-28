import { existsSync } from 'fs'
import { mkdir, unlink, writeFile } from 'fs/promises'
import path from 'path'
import { validateUploadFile } from '@/infrastructure/upload/validators'
import { buildPublicUrl, getUploadDir } from '@/lib/upload-paths'
import { BadRequestError } from '@/lib/errors'
import { logger } from '@/lib/logger'
import type { LogoStorage, SavedLogo } from '../application/ports/LogoStorage'

const UPLOAD_CATEGORY = 'company-logo' as const
const UPLOAD_DIR = getUploadDir(UPLOAD_CATEGORY)

export class LocalLogoStorage implements LogoStorage {
  async validateAndWrite(file: File): Promise<SavedLogo> {
    const result = await validateUploadFile(file, { allowedKinds: ['IMAGE'] })
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
    }
  }

  async removeByAbsolutePath(absolutePath: string): Promise<void> {
    try {
      if (existsSync(absolutePath)) {
        await unlink(absolutePath)
      }
    } catch (err) {
      logger.warn({ err, absolutePath }, 'failed to cleanup logo file')
    }
  }
}
