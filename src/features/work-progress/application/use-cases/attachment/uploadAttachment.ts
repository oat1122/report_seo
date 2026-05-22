import { ForbiddenError, NotFoundError } from "@/lib/errors";
import type { WorkProgressRepository } from "../../ports/WorkProgressRepository";
import type { WorkProgressAttachmentRepository } from "../../ports/WorkProgressAttachmentRepository";
import type { AttachmentStorage } from "../../ports/AttachmentStorage";
import type { WorkProgressActivityRepository } from "../../ports/WorkProgressActivityRepository";

export function uploadAttachmentUseCase(
  repo: WorkProgressRepository,
  attachmentRepo: WorkProgressAttachmentRepository,
  storage: AttachmentStorage,
  activityRepo: WorkProgressActivityRepository,
) {
  return async (
    customerId: string,
    planId: string,
    itemId: string,
    file: File,
    caption: string | null,
    uploadedById: string,
  ) => {
    const item = await repo.findItemById(itemId);
    if (!item) throw new NotFoundError("ไม่พบรายการ");
    if (item.planId !== planId) {
      throw new ForbiddenError("รายการไม่อยู่ในแผนงานที่ระบุ");
    }
    const plan = await repo.findById(planId);
    if (!plan || plan.customerId !== customerId) {
      throw new ForbiddenError("ไม่มีสิทธิ์แก้ไขแผนงานนี้");
    }

    const saved = await storage.validateAndWrite(file);
    let created;
    try {
      const isImage = saved.mimeType.startsWith("image/");
      created = await attachmentRepo.create({
        itemId,
        kind: isImage ? "IMAGE" : "FILE",
        url: saved.url,
        filename: saved.filename,
        mimeType: saved.mimeType,
        sizeBytes: saved.sizeBytes,
        caption,
        uploadedById,
      });
    } catch (err) {
      // rollback file ถ้า DB insert fail (ตาม payment pattern)
      await storage.removeByAbsolutePath(saved.absolutePath);
      throw err;
    }
    await activityRepo.log({
      planId,
      actorId: uploadedById,
      action: "ATTACHMENT_UPLOADED",
      entity: "ATTACHMENT",
      entityId: created.id,
      diff: {
        after: created,
        itemId,
        filename: saved.filename,
        mimeType: saved.mimeType,
        sizeBytes: saved.sizeBytes,
        caption,
      },
    });
    return created;
  };
}
