import {
  BadRequestError,
  ForbiddenError,
  NotFoundError,
} from "@/lib/errors";
import { importPlanItemsSchema } from "../../../schemas";
import type {
  CreatePlanItemSeed,
  WorkProgressRepository,
} from "../../ports/WorkProgressRepository";
import type { WorkProgressMasterRepository } from "../../ports/WorkProgressMasterRepository";
import type { WorkProgressActivityRepository } from "../../ports/WorkProgressActivityRepository";

export function importPlanItemsUseCase(
  repo: WorkProgressRepository,
  masterRepo: WorkProgressMasterRepository,
  activityRepo: WorkProgressActivityRepository,
) {
  return async (
    customerId: string,
    planId: string,
    actorId: string | null,
    raw: unknown,
  ) => {
    const parsed = importPlanItemsSchema.safeParse(raw);
    if (!parsed.success) {
      const detail = parsed.error.issues
        .map((i) => `${i.path.join(".") || "(root)"}: ${i.message}`)
        .join(", ");
      throw new BadRequestError(`Invalid import data: ${detail}`);
    }
    const { rows } = parsed.data;

    const plan = await repo.findById(planId);
    if (!plan) throw new NotFoundError("ไม่พบแผนงาน");
    if (plan.customerId !== customerId) {
      throw new ForbiddenError("ไม่มีสิทธิ์แก้ไขแผนงานนี้");
    }

    const [categories, statuses, defaultStatus] = await Promise.all([
      masterRepo.listCategories({ onlyActive: true }),
      masterRepo.listStatuses({ onlyActive: true }),
      masterRepo.findDefaultStatus(),
    ]);
    const categoryByCode = new Map(
      categories.map((c) => [c.code.toUpperCase(), c]),
    );
    const statusByCode = new Map(
      statuses.map((s) => [s.code.toUpperCase(), s]),
    );

    const fallbackStatus = defaultStatus ?? statuses[0];
    if (!fallbackStatus) {
      throw new BadRequestError("ยังไม่ได้ตั้งค่าสถานะ — ตั้ง default status ก่อน import");
    }

    const seeds: CreatePlanItemSeed[] = [];
    const errors: Array<{ row: number; message: string }> = [];

    rows.forEach((row, idx) => {
      const category = categoryByCode.get(row.categoryCode.toUpperCase());
      if (!category) {
        errors.push({
          row: idx + 1,
          message: `categoryCode "${row.categoryCode}" ไม่พบในระบบ`,
        });
        return;
      }
      let status = fallbackStatus;
      if (row.statusCode) {
        const found = statusByCode.get(row.statusCode.toUpperCase());
        if (!found) {
          errors.push({
            row: idx + 1,
            message: `statusCode "${row.statusCode}" ไม่พบในระบบ`,
          });
          return;
        }
        status = found;
      }
      seeds.push({
        categoryId: category.id,
        statusId: status.id,
        activity: row.activity,
        description: row.description ?? null,
        duration: row.duration ?? null,
        weight: row.weight ?? 1,
        orderIndex: 0, // adapter จะคำนวณจาก max(orderIndex)
      });
    });

    if (errors.length > 0) {
      throw new BadRequestError(
        `Import มีข้อผิดพลาด ${errors.length} แถว: ${errors
          .slice(0, 5)
          .map((e) => `แถว ${e.row}: ${e.message}`)
          .join(" · ")}${errors.length > 5 ? " ..." : ""}`,
      );
    }

    const result = await repo.createManyItems(planId, seeds);
    await activityRepo.log({
      planId,
      actorId,
      action: "ITEMS_IMPORTED",
      entity: "ITEM",
      entityId: null,
      diff: { input: { rowCount: rows.length }, after: result },
    });
    return result;
  };
}
