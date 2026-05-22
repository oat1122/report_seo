import { BadRequestError, ForbiddenError } from "@/lib/errors";
import { Role } from "@/types/auth";
import { createPlanSchema } from "../../../schemas";
import { generatePeriods } from "../../../domain/policies/period-generator";
import type {
  CreatePlanItemSeed,
  WorkProgressRepository,
} from "../../ports/WorkProgressRepository";
import type { WorkProgressMasterRepository } from "../../ports/WorkProgressMasterRepository";
import type { WorkProgressTemplateRepository } from "../../ports/WorkProgressTemplateRepository";

export function createPlanUseCase(
  repo: WorkProgressRepository,
  masterRepo: WorkProgressMasterRepository,
  templateRepo: WorkProgressTemplateRepository,
) {
  return async (
    customerId: string,
    createdById: string | null,
    sessionRole: Role,
    raw: unknown,
  ) => {
    const parsed = createPlanSchema.safeParse(raw);
    if (!parsed.success) {
      const detail = parsed.error.issues
        .map((i) => `${i.path.join(".") || "(root)"}: ${i.message}`)
        .join(", ");
      throw new BadRequestError(`Invalid plan data: ${detail}`);
    }
    const input = parsed.data;

    // ───── Branch: from template ─────────────────────────────
    if (input.templateId) {
      const template = await templateRepo.findById(input.templateId);
      if (!template) throw new BadRequestError("ไม่พบ template");
      if (!template.isActive) {
        throw new BadRequestError("template ถูกปิดใช้งานอยู่");
      }

      // ใช้ periodType ของ template เป็นหลัก (override ค่าใน body)
      const periods = generatePeriods(template.periodType, {
        year: input.year,
        customPeriods: input.customPeriods,
      });
      if (periods.length === 0) {
        throw new BadRequestError(
          "ไม่สามารถ generate periods ได้จาก template — โปรดตรวจ periodType / customPeriods",
        );
      }

      const defaultStatus = await masterRepo.findDefaultStatus();
      if (!defaultStatus) {
        throw new BadRequestError(
          "ระบบยังไม่มี default status — แอดมินต้องตั้ง isDefault=true ให้ status อย่างน้อย 1 ตัว",
        );
      }

      const items: CreatePlanItemSeed[] = template.items.map((it, i) => ({
        categoryId: it.categoryId,
        statusId: defaultStatus.id,
        activity: it.activity,
        description: it.description,
        duration: it.duration,
        weight: it.weight,
        orderIndex: it.orderIndex ?? i,
      }));

      return repo.createPlanWithItems(
        {
          customerId,
          title: input.title,
          periodType: template.periodType,
          year: input.year ?? null,
          startDate: periods[0]?.startDate ?? null,
          endDate: periods[periods.length - 1]?.endDate ?? null,
          packageName: input.packageName ?? null,
          note: input.note ?? null,
          createdById,
        },
        periods,
        items,
      );
    }

    // ───── Branch: clone from existing plan ──────────────────
    if (input.cloneFromPlanId) {
      const source = await repo.findById(input.cloneFromPlanId);
      if (!source) throw new BadRequestError("ไม่พบแผนงานต้นทาง");

      // non-ADMIN clone ข้ามลูกค้าไม่ได้
      if (sessionRole !== Role.ADMIN && source.customerId !== customerId) {
        throw new ForbiddenError(
          "เฉพาะ ADMIN ที่ clone แผนงานข้ามลูกค้าได้",
        );
      }

      const periods = generatePeriods(source.periodType, {
        year: input.year,
        customPeriods: input.customPeriods,
      });
      if (periods.length === 0) {
        throw new BadRequestError(
          "ไม่สามารถ generate periods ได้จากแผนต้นทาง — โปรดตรวจ periodType / customPeriods",
        );
      }

      const defaultStatus = await masterRepo.findDefaultStatus();
      if (!defaultStatus) {
        throw new BadRequestError(
          "ระบบยังไม่มี default status — แอดมินต้องตั้ง isDefault=true ให้ status อย่างน้อย 1 ตัว",
        );
      }

      const seeds = await repo.findItemsForClone(input.cloneFromPlanId);
      const items: CreatePlanItemSeed[] = seeds.map((s, i) => ({
        categoryId: s.categoryId,
        statusId: defaultStatus.id,
        activity: s.activity,
        description: s.description,
        duration: s.duration,
        weight: s.weight,
        orderIndex: s.orderIndex ?? i,
      }));

      return repo.createPlanWithItems(
        {
          customerId,
          title: input.title,
          periodType: source.periodType,
          year: input.year ?? null,
          startDate: periods[0]?.startDate ?? null,
          endDate: periods[periods.length - 1]?.endDate ?? null,
          packageName: input.packageName ?? null,
          note: input.note ?? null,
          createdById,
        },
        periods,
        items,
      );
    }

    // ───── Branch: empty plan (Phase 1 behavior) ─────────────
    const periods = generatePeriods(input.periodType, {
      year: input.year,
      customPeriods: input.customPeriods,
    });
    if (periods.length === 0) {
      throw new BadRequestError(
        "ไม่สามารถ generate periods ได้ — โปรดตรวจสอบ periodType / customPeriods",
      );
    }
    return repo.createPlanWithPeriods(
      {
        customerId,
        title: input.title,
        periodType: input.periodType,
        year: input.year ?? null,
        startDate: periods[0]?.startDate ?? null,
        endDate: periods[periods.length - 1]?.endDate ?? null,
        packageName: input.packageName ?? null,
        note: input.note ?? null,
        createdById,
      },
      periods,
    );
  };
}
