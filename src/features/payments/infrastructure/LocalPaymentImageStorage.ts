import { existsSync } from 'fs'
import { mkdir, unlink, writeFile } from 'fs/promises'
import path from 'path'
import { validateUploadFile } from '@/infrastructure/upload/validators'
import { buildPublicUrl, getUploadDir } from '@/lib/upload-paths'
import { BadRequestError } from '@/lib/errors'
import { logger } from '@/lib/logger'
import type {
  PaymentImageStorage,
  SavedPaymentImage,
} from '../application/ports/PaymentImageStorage'

const UPLOAD_CATEGORY = 'payments' as const
const UPLOAD_DIR = getUploadDir(UPLOAD_CATEGORY)

export class LocalPaymentImageStorage implements PaymentImageStorage {
  async validateAndWrite(file: File): Promise<SavedPaymentImage> {
    const result = await validateUploadFile(file)
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
      // ลบไฟล์ orphan ไม่สำเร็จ — log warn ไว้ให้ cron sweep หรือคน on-call ตามเก็บ
      logger.warn({ err, absolutePath }, 'failed to cleanup payment upload file')
    }
  }
}
