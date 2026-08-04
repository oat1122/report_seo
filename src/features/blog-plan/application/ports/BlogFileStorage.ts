import type { BlogFileKind } from '../../domain/BlogArticle'

export interface SavedBlogFile {
  url: string
  absolutePath: string
  filename: string
  mimeType: string
  sizeBytes: number
}

export interface BlogFileStorage {
  /**
   * Validate ตาม kind (ภาพปก = IMAGE 5MB, ไฟล์บทความ = FILE 20MB) แล้วเขียนลง upload dir
   * Throw BadRequestError ถ้าไฟล์ไม่ผ่าน validation
   */
  validateAndWrite(file: File, kind: BlogFileKind): Promise<SavedBlogFile>

  /** ลบไฟล์แบบ best-effort — ใช้ rollback เมื่อ DB insert fail หรือ user ลบไฟล์ */
  removeByPublicUrl(url: string): Promise<void>
  removeByAbsolutePath(absolutePath: string): Promise<void>
}
