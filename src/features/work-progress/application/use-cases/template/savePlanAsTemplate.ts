import { BadRequestError, NotFoundError } from "@/lib/errors";
import { savePlanAsTemplateSchema } from "../../../schemas";
import type { WorkProgressRepository } from "../../ports/WorkProgressRepository";
import type {
  CreateTemplateItemData,
  WorkProgressTemplateRepository,
} from "../../ports/WorkProgressTemplateRepository";

export function savePlanAsTemplateUseCase(
  repo: WorkProgressRepository,
  templateRepo: WorkProgressTemplateRepository,
) {
  return async (
    customerId: string,
    planId: string,
    createdById: string | null,
    raw: unknown,
  ) => {
    const parsed = savePlanAsTemplateSchema.safeParse(raw);
    if (!parsed.success) {
      const detail = parsed.error.issues
        .map((i) => `${i.path.join(".") || "(root)"}: ${i.message}`)
        .join(", ");
      throw new BadRequestError(`Invalid save-as-template data: ${detail}`);
    }
    const input = parsed.data;

    const plan = await repo.findById(planId);
    if (!plan) throw new NotFoundError("ไม่พบแผนงาน");
    if (plan.customerId !== customerId) {
      throw new BadRequestError("แผนงานไม่ตรงกับลูกค้าที่ระบุ");
    }

    const seeds = await repo.findItemsForClone(planId);
    if (seeds.length === 0) {
      throw new BadRequestError(
        "ไม่สามารถบันทึกเป็น template ได้ — แผนงานต้องมีกิจกรรมอย่างน้อย 1 รายการ",
      );
    }

    const items: CreateTemplateItemData[] = seeds.map((s, i) => ({
      categoryId: s.categoryId,
      activity: s.activity,
      description: s.description,
      duration: s.duration,
      weight: s.weight,
      orderIndex: s.orderIndex ?? i,
      defaultPeriods: null,
    }));

    return templateRepo.create(
      {
        name: input.name,
        description: input.description ?? null,
        periodType: plan.periodType,
        isActive: input.isActive,
        createdById,
      },
      items,
    );
  };
}
