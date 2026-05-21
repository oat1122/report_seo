import { BadRequestError, NotFoundError } from "@/lib/errors";
import {
  serializeAiOverview,
  type SerializedAiOverview,
} from "../../domain/AiOverview";
import {
  MAX_AI_OVERVIEW_IMAGES,
  type AiOverviewUpdateInput,
} from "../../schemas";
import type { AiOverviewRepository } from "../ports/AiOverviewRepository";
import type { ImageStorage } from "../ports/ImageStorage";

export function updateAiOverviewUseCase(
  repo: AiOverviewRepository,
  storage: ImageStorage,
) {
  return async (
    customerInternalId: string,
    id: string,
    input: AiOverviewUpdateInput,
    newFiles: File[],
    imageIdsToDelete: string[],
  ): Promise<SerializedAiOverview> => {
    const existing = await repo.findById(id, customerInternalId);
    if (!existing) {
      throw new NotFoundError("ไม่พบข้อมูล AI Overview");
    }

    const remainingCount =
      existing.images.length -
      existing.images.filter((img) => imageIdsToDelete.includes(img.id))
        .length;
    const totalAfterUpdate = remainingCount + newFiles.length;

    if (totalAfterUpdate === 0) {
      throw new BadRequestError("ต้องมีรูปภาพอย่างน้อย 1 รูป");
    }
    if (totalAfterUpdate > MAX_AI_OVERVIEW_IMAGES) {
      throw new BadRequestError(
        `อัปโหลดรูปภาพได้สูงสุด ${MAX_AI_OVERVIEW_IMAGES} รูป`,
      );
    }

    const imagesToDelete = existing.images.filter((img) =>
      imageIdsToDelete.includes(img.id),
    );

    const saved =
      newFiles.length > 0 ? await storage.validateAndWrite(newFiles) : [];

    try {
      const result = await repo.applyUpdate(id, input, {
        imageIdsToRemove: imagesToDelete.map((img) => img.id),
        newImageUrls: saved.map((s) => s.url),
        fallbackDisplayDate: existing.displayDate,
      });

      // DB เรียบร้อย — clean ไฟล์เก่าทิ้ง (ผิดพลาดที่นี่ไม่กระทบ DB)
      for (const image of imagesToDelete) {
        try {
          await storage.removeByUrl(image.imageUrl);
        } catch (err) {
          console.error("Failed to remove old image", err);
        }
      }

      return serializeAiOverview(result);
    } catch (error) {
      // DB ล้ม — rollback ไฟล์ที่เพิ่งเขียน
      await Promise.all(
        saved.map((s) => storage.removeByAbsolutePath(s.absolutePath)),
      );
      throw error;
    }
  };
}
