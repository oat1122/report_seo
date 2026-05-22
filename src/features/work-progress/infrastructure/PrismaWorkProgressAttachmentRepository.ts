import { prisma } from "@/infrastructure/prisma/client";
import type {
  AttachmentKind,
  WorkProgressAttachment,
} from "../domain/WorkProgressAttachment";
import type {
  CreateAttachmentData,
  WorkProgressAttachmentRepository,
} from "../application/ports/WorkProgressAttachmentRepository";

function toDomain(row: {
  id: string;
  itemId: string;
  kind: string;
  url: string;
  filename: string | null;
  mimeType: string | null;
  sizeBytes: number | null;
  caption: string | null;
  uploadedById: string | null;
  createdAt: Date;
}): WorkProgressAttachment {
  return {
    id: row.id,
    itemId: row.itemId,
    kind: row.kind as AttachmentKind,
    url: row.url,
    filename: row.filename,
    mimeType: row.mimeType,
    sizeBytes: row.sizeBytes,
    caption: row.caption,
    uploadedById: row.uploadedById,
    createdAt: row.createdAt,
  };
}

export class PrismaWorkProgressAttachmentRepository
  implements WorkProgressAttachmentRepository
{
  async listByItem(itemId: string): Promise<WorkProgressAttachment[]> {
    const rows = await prisma.workProgressAttachment.findMany({
      where: { itemId },
      orderBy: { createdAt: "desc" },
    });
    return rows.map(toDomain);
  }

  async findById(
    attachmentId: string,
  ): Promise<WorkProgressAttachment | null> {
    const row = await prisma.workProgressAttachment.findUnique({
      where: { id: attachmentId },
    });
    return row ? toDomain(row) : null;
  }

  async create(data: CreateAttachmentData): Promise<WorkProgressAttachment> {
    const row = await prisma.workProgressAttachment.create({
      data: {
        itemId: data.itemId,
        kind: data.kind,
        url: data.url,
        filename: data.filename,
        mimeType: data.mimeType,
        sizeBytes: data.sizeBytes,
        caption: data.caption,
        uploadedById: data.uploadedById,
      },
    });
    return toDomain(row);
  }

  async delete(attachmentId: string): Promise<void> {
    await prisma.workProgressAttachment.delete({ where: { id: attachmentId } });
  }
}
