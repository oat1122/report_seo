import { BadRequestError } from "@/lib/errors";
import {
  serializeAiOverview,
  type SerializedAiOverview,
} from "../../domain/AiOverview";
import {
  MAX_AI_OVERVIEW_IMAGES,
  type AiOverviewCreateInput,
} from "../../schemas";
import type { AiOverviewRepository } from "../ports/AiOverviewRepository";
import type { ImageStorage } from "../ports/ImageStorage";

export function createAiOverviewUseCase(
  repo: AiOverviewRepository,
  storage: ImageStorage,
) {
  return async (
    customerInternalId: string,
    input: AiOverviewCreateInput,
    files: File[],
  ): Promise<SerializedAiOverview> => {
    if (files.length === 0) {
      throw new BadRequestError("กรุณาอัปโหลดรูปภาพอย่างน้อย 1 รูป");
    }
    if (files.length > MAX_AI_OVERVIEW_IMAGES) {
      throw new BadRequestError(
        `อัปโหลดรูปภาพได้สูงสุด ${MAX_AI_OVERVIEW_IMAGES} รูป`,
      );
    }

    const saved = await storage.validateAndWrite(files);

    try {
      const created = await repo.create(
        customerInternalId,
        input,
        saved.map((s) => s.url),
      );
      return serializeAiOverview(created);
    } catch (error) {
      // DB ล้มเหลว — clean up ไฟล์ที่เพิ่งเขียนใหม่
      await Promise.all(
        saved.map((s) => storage.removeByAbsolutePath(s.absolutePath)),
      );
      throw error;
    }
  };
}
