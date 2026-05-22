import { ForbiddenError, NotFoundError } from "@/lib/errors";
import { resolveUploadPath } from "@/lib/upload-paths";
import { logger } from "@/lib/logger";
import type { WorkProgressRepository } from "../../ports/WorkProgressRepository";
import type { WorkProgressAttachmentRepository } from "../../ports/WorkProgressAttachmentRepository";
import type { AttachmentStorage } from "../../ports/AttachmentStorage";
import type { WorkProgressActivityRepository } from "../../ports/WorkProgressActivityRepository";

export function deleteAttachmentUseCase(
  repo: WorkProgressRepository,
  attachmentRepo: WorkProgressAttachmentRepository,
  storage: AttachmentStorage,
  activityRepo: WorkProgressActivityRepository,
) {
  return async (
    customerId: string,
    planId: string,
    itemId: string,
    attachmentId: string,
    actorId: string | null,
  ) => {
    const attachment = await attachmentRepo.findById(attachmentId);
    if (!attachment) throw new NotFoundError("ไม่พบไฟล์แนบ");
    if (attachment.itemId !== itemId) {
      throw new ForbiddenError("ไฟล์แนบไม่อยู่ในรายการที่ระบุ");
    }
    const item = await repo.findItemById(itemId);
    if (!item || item.planId !== planId) {
      throw new ForbiddenError("รายการไม่อยู่ในแผนงานที่ระบุ");
    }
    const plan = await repo.findById(planId);
    if (!plan || plan.customerId !== customerId) {
      throw new ForbiddenError("ไม่มีสิทธิ์แก้ไขแผนงานนี้");
    }

    await attachmentRepo.delete(attachmentId);

    // ลบไฟล์จริงถ้าเป็น IMAGE/FILE (LINK ไม่มีไฟล์)
    if (attachment.kind !== "LINK") {
      try {
        const absolute = resolveUploadPath(attachment.url, "work-progress");
        await storage.removeByAbsolutePath(absolute);
      } catch (err) {
        // ไฟล์อาจถูกลบไปแล้วหรือ path ผิด — log warn ไม่ throw
        logger.warn(
          { err, attachmentId, url: attachment.url },
          "failed to remove attachment file",
        );
      }
    }

    await activityRepo.log({
      planId,
      actorId,
      action: "ATTACHMENT_DELETED",
      entity: "ATTACHMENT",
      entityId: attachmentId,
      diff: { entity: attachment, itemId },
    });
  };
}
