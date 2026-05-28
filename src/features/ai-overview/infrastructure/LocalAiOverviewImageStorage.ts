import { existsSync } from 'fs'
import { mkdir, unlink, writeFile } from 'fs/promises'
import path from 'path'
import { validateUploadFile, type ValidatedFile } from '@/infrastructure/upload/validators'
import { buildPublicUrl, getUploadDir, resolveUploadPath } from '@/lib/upload-paths'
import { BadRequestError } from '@/lib/errors'
import type { ImageStorage, SavedImage } from '../application/ports/ImageStorage'

const UPLOAD_CATEGORY = 'ai-overview' as const
const UPLOAD_DIR = getUploadDir(UPLOAD_CATEGORY)

async function ensureUploadDir() {
  if (!existsSync(UPLOAD_DIR)) {
    await mkdir(UPLOAD_DIR, { recursive: true })
  }
}

async function safeUnlink(absolutePath: string) {
  try {
    if (existsSync(absolutePath)) {
      await unlink(absolutePath)
    }
  } catch (err) {
    console.error(`Failed to delete file: ${absolutePath}`, err)
  }
}

async function validateAll(files: File[]): Promise<ValidatedFile[]> {
  const validated: ValidatedFile[] = []
  for (const file of files) {
    const result = await validateUploadFile(file)
    if (!result.isValid || !result.validatedFile) {
      throw new BadRequestError(result.error || 'ไฟล์ไม่ผ่านการตรวจสอบ')
    }
    validated.push(result.validatedFile)
  }
  return validated
}

export class LocalAiOverviewImageStorage implements ImageStorage {
  async validateAndWrite(files: File[]): Promise<SavedImage[]> {
    const validated = await validateAll(files)
    await ensureUploadDir()

    const saved: SavedImage[] = []
    try {
      for (const file of validated) {
        const absolutePath = path.join(UPLOAD_DIR, file.filename)
        await writeFile(absolutePath, file.buffer)
        saved.push({
          url: buildPublicUrl(UPLOAD_CATEGORY, file.filename),
          absolutePath,
        })
      }
      return saved
    } catch (error) {
      // ถ้า write ล้มกลางทาง (เช่น disk full ตอนรูปที่ 3) — ลบรูปที่เพิ่งเขียนไปแล้ว
      // ไม่งั้น caller (createAiOverview try/catch) ไม่เห็น saved[] เลยเพราะ throw มาก่อน return
      await Promise.all(saved.map((s) => safeUnlink(s.absolutePath)))
      throw error
    }
  }

  async removeByAbsolutePath(absolutePath: string): Promise<void> {
    await safeUnlink(absolutePath)
  }

  async removeByUrl(url: string): Promise<void> {
    const absolute = resolveUploadPath(url, UPLOAD_CATEGORY)
    await safeUnlink(absolute)
  }
}
