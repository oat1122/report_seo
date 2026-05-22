import { ForbiddenError, NotFoundError } from "@/lib/errors";
import type { WorkProgressRepository } from "../../ports/WorkProgressRepository";
import type { WorkProgressItemMetaRepository } from "../../ports/WorkProgressItemMetaRepository";

export function deleteMetaUseCase(
  repo: WorkProgressRepository,
  metaRepo: WorkProgressItemMetaRepository,
) {
  return async (
    customerId: string,
    planId: string,
    itemId: string,
    key: string,
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

    await metaRepo.delete(itemId, key);
  };
}
