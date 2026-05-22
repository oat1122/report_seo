import {
  BadRequestError,
  ForbiddenError,
  NotFoundError,
} from "@/lib/errors";
import { bulkUpsertMetaSchema } from "../../../schemas";
import type { WorkProgressRepository } from "../../ports/WorkProgressRepository";
import type { WorkProgressItemMetaRepository } from "../../ports/WorkProgressItemMetaRepository";
import type { WorkProgressActivityRepository } from "../../ports/WorkProgressActivityRepository";

export function bulkUpsertMetaUseCase(
  repo: WorkProgressRepository,
  metaRepo: WorkProgressItemMetaRepository,
  activityRepo: WorkProgressActivityRepository,
) {
  return async (
    customerId: string,
    planId: string,
    itemId: string,
    actorId: string | null,
    raw: unknown,
  ) => {
    const parsed = bulkUpsertMetaSchema.safeParse(raw);
    if (!parsed.success) {
      const detail = parsed.error.issues
        .map((i) => `${i.path.join(".") || "(root)"}: ${i.message}`)
        .join(", ");
      throw new BadRequestError(`Invalid bulk meta data: ${detail}`);
    }
    const { entries } = parsed.data;

    const item = await repo.findItemById(itemId);
    if (!item) throw new NotFoundError("ไม่พบรายการ");
    if (item.planId !== planId) {
      throw new ForbiddenError("รายการไม่อยู่ในแผนงานที่ระบุ");
    }
    const plan = await repo.findById(planId);
    if (!plan || plan.customerId !== customerId) {
      throw new ForbiddenError("ไม่มีสิทธิ์แก้ไขแผนงานนี้");
    }

    // กัน key ซ้ำใน batch เดียวกัน (DB unique enforce ระดับ row แต่ batch อาจเขียนทับกันเอง)
    const seen = new Set<string>();
    for (const e of entries) {
      if (seen.has(e.key)) {
        throw new BadRequestError(`key "${e.key}" ซ้ำใน batch`);
      }
      seen.add(e.key);
    }

    const result = await metaRepo.upsertMany(itemId, entries);
    await activityRepo.log({
      planId,
      actorId,
      action: "META_BULK_UPSERTED",
      entity: "META",
      entityId: null,
      diff: { itemId, input: { entries }, after: result },
    });
    return result;
  };
}
