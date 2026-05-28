export interface SavedAttachment {
  url: string
  absolutePath: string
  filename: string
  mimeType: string
  sizeBytes: number
}

export interface AttachmentStorage {
  /**
   * Validate file (extension/MIME/magic byte/size) แล้วเขียนลงโฟลเดอร์ upload
   * Throw BadRequestError ถ้าไฟล์ไม่ผ่าน validation
   */
  validateAndWrite(file: File): Promise<SavedAttachment>

  /**
   * ลบไฟล์ทิ้ง (best-effort) — caller เรียกเพื่อ rollback เมื่อ DB insert fail
   */
  removeByAbsolutePath(absolutePath: string): Promise<void>
}
