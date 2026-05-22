import {
  BadRequestError,
  ForbiddenError,
  NotFoundError,
} from "@/lib/errors";
import { upsertMetaSchema } from "../../../schemas";
import type { WorkProgressRepository } from "../../ports/WorkProgressRepository";
import type { WorkProgressItemMetaRepository } from "../../ports/WorkProgressItemMetaRepository";
import type { WorkProgressActivityRepository } from "../../ports/WorkProgressActivityRepository";

export function upsertMetaUseCase(
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
    const parsed = upsertMetaSchema.safeParse(raw);
    if (!parsed.success) {
      const detail = parsed.error.issues
        .map((i) => `${i.path.join(".") || "(root)"}: ${i.message}`)
        .join(", ");
      throw new BadRequestError(`Invalid meta data: ${detail}`);
    }
    const input = parsed.data;

    const item = await repo.findItemById(itemId);
    if (!item) throw new NotFoundError("ไม่พบรายการ");
    if (item.planId !== planId) {
      throw new ForbiddenError("รายการไม่อยู่ในแผนงานที่ระบุ");
    }
    const plan = await repo.findById(planId);
    if (!plan || plan.customerId !== customerId) {
      throw new ForbiddenError("ไม่มีสิทธิ์แก้ไขแผนงานนี้");
    }

    const upserted = await metaRepo.upsert({
      itemId,
      key: input.key,
      value: input.value,
      valueType: input.valueType,
    });
    await activityRepo.log({
      planId,
      actorId,
      action: "META_UPSERTED",
      entity: "META",
      entityId: upserted.id,
      diff: { input, after: upserted, itemId },
    });
    return upserted;
  };
}
