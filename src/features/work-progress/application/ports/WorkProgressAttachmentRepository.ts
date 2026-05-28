import type { AttachmentKind, WorkProgressAttachment } from '../../domain/WorkProgressAttachment'

export interface CreateAttachmentData {
  itemId: string
  kind: AttachmentKind
  url: string
  filename: string | null
  mimeType: string | null
  sizeBytes: number | null
  caption: string | null
  uploadedById: string | null
}

export interface WorkProgressAttachmentRepository {
  listByItem(itemId: string): Promise<WorkProgressAttachment[]>
  findById(attachmentId: string): Promise<WorkProgressAttachment | null>
  create(data: CreateAttachmentData): Promise<WorkProgressAttachment>
  delete(attachmentId: string): Promise<void>
}
