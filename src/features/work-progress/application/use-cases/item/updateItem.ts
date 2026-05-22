import {
  BadRequestError,
  ForbiddenError,
  NotFoundError,
} from "@/lib/errors";
import { updateItemSchema } from "../../../schemas";
import type {
  UpdateItemData,
  WorkProgressRepository,
} from "../../ports/WorkProgressRepository";
import type { WorkProgressMasterRepository } from "../../ports/WorkProgressMasterRepository";

export function updateItemUseCase(
  repo: WorkProgressRepository,
  masterRepo: WorkProgressMasterRepository,
) {
  return async (
    customerId: string,
    planId: string,
    itemId: string,
    raw: unknown,
  ) => {
    const parsed = updateItemSchema.safeParse(raw);
    if (!parsed.success) {
      const detail = parsed.error.issues
        .map((i) => `${i.path.join(".") || "(root)"}: ${i.message}`)
        .join(", ");
      throw new BadRequestError(`Invalid update data: ${detail}`);
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

    const patch: UpdateItemData = {};
    if (input.categoryId !== undefined) {
      const category = await masterRepo.findCategoryById(input.categoryId);
      if (!category || !category.isActive) {
        throw new BadRequestError("หมวดหมู่ไม่ถูกต้องหรือถูกปิดใช้งาน");
      }
      patch.categoryId = input.categoryId;
    }
    if (input.statusId !== undefined) {
      const status = await masterRepo.findStatusById(input.statusId);
      if (!status || !status.isActive) {
        throw new BadRequestError("สถานะไม่ถูกต้องหรือถูกปิดใช้งาน");
      }
      patch.statusId = input.statusId;
      // status terminal → auto set completedAt (ถ้ายังไม่มี)
      if (status.isTerminal && item.completedAt === null) {
        patch.completedAt = new Date();
      } else if (!status.isTerminal && item.completedAt !== null) {
        // ย้อนกลับจาก terminal → ล้าง completedAt
        patch.completedAt = null;
      }
    }
    if (input.activity !== undefined) patch.activity = input.activity;
    if (input.description !== undefined) patch.description = input.description;
    if (input.duration !== undefined) patch.duration = input.duration;
    if (input.note !== undefined) patch.note = input.note;
    if (input.weight !== undefined) patch.weight = input.weight;
    if (input.progressPercent !== undefined)
      patch.progressPercent = input.progressPercent;
    if (input.startDate !== undefined) patch.startDate = input.startDate;
    if (input.dueDate !== undefined) patch.dueDate = input.dueDate;

    return repo.updateItem(itemId, patch);
  };
}
