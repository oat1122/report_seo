import { BadRequestError, ForbiddenError } from "@/lib/errors";
import { Role } from "@/types/auth";
import { createPlanSchema } from "../../../schemas";
import {
  generatePeriods,
  generateMonthRangePeriods,
  type PeriodSeed,
} from "../../../domain/policies/period-generator";
import { parseTemplateDefaultPeriods } from "../../../domain/policies/template-default-periods";
import type {
  CreatePlanItemPeriodMarkSeed,
  CreatePlanItemSeed,
  WorkProgressRepository,
} from "../../ports/WorkProgressRepository";
import type { WorkProgressMasterRepository } from "../../ports/WorkProgressMasterRepository";
import type { WorkProgressTemplateRepository } from "../../ports/WorkProgressTemplateRepository";
import type { WorkProgressActivityRepository } from "../../ports/WorkProgressActivityRepository";
import type { CreatePlanInput } from "../../../schemas";

// คืน periods + ค่า year/start/end สำหรับเก็บใน Plan
// ถ้ามี monthRange (start/end month+year) จะ override periodType เป็น monthly rolling cross-year
function resolvePeriods(input: CreatePlanInput, fallbackPeriodType: CreatePlanInput["periodType"]): {
  periods: PeriodSeed[];
  yearForRecord: number | null;
} {
  const hasRange =
    input.startMonth !== undefined &&
    input.startYear !== undefined &&
    input.endMonth !== undefined &&
    input.endYear !== undefined;

  if (hasRange) {
    const periods = generateMonthRangePeriods({
      startMonth: input.startMonth!,
      startYear: input.startYear!,
      endMonth: input.endMonth!,
      endYear: input.endYear!,
    });
    return { periods, yearForRecord: input.startYear ?? null };
  }

  const periods = generatePeriods(fallbackPeriodType, {
    year: input.year,
    customPeriods: input.customPeriods,
  });
  return { periods, yearForRecord: input.year ?? null };
}

export function createPlanUseCase(
  repo: WorkProgressRepository,
  masterRepo: WorkProgressMasterRepository,
  templateRepo: WorkProgressTemplateRepository,
  activityRepo: WorkProgressActivityRepository,
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

      // monthRange override → period type effective = YEAR_12_MONTHS (monthly)
      const { periods, yearForRecord } = resolvePeriods(input, template.periodType);
      if (periods.length === 0) {
        throw new BadRequestError(
          "ไม่สามารถ generate periods ได้จาก template — โปรดตรวจช่วงเดือน / periodType / customPeriods",
        );
      }

      const defaultStatus = await masterRepo.findDefaultStatus();
      if (!defaultStatus) {
        throw new BadRequestError(
          "ระบบยังไม่มี default status — แอดมินต้องตั้ง isDefault=true ให้ status อย่างน้อย 1 ตัว",
        );
      }

      const activeMarkTypes = await masterRepo.listMarkTypes({
        onlyActive: true,
      });
      const validMarkTypeIds = new Set(activeMarkTypes.map((m) => m.id));
      const validSeqs = new Set(periods.map((p) => p.seq));

      const items: CreatePlanItemSeed[] = template.items.map((it, i) => {
        const defaults = parseTemplateDefaultPeriods(it.defaultPeriods);
        const periodMarks: CreatePlanItemPeriodMarkSeed[] = [];
        for (const [seqStr, entry] of Object.entries(defaults)) {
          const seq = Number(seqStr);
          if (!Number.isInteger(seq) || !validSeqs.has(seq)) continue;
          if (!validMarkTypeIds.has(entry.markTypeId)) continue;
          periodMarks.push({ seq, markTypeId: entry.markTypeId });
        }
        return {
          categoryId: it.categoryId,
          statusId: defaultStatus.id,
          activity: it.activity,
          description: it.description,
          duration: it.duration,
          weight: it.weight,
          orderIndex: it.orderIndex ?? i,
          subtasks: (it.subtasks ?? []).map((s, idx) => ({
            title: s.title,
            orderIndex: s.orderIndex ?? idx,
          })),
          periodMarks,
        };
      });

      const created = await repo.createPlanWithItems(
        {
          customerId,
          title: input.title,
          periodType: template.periodType,
          year: yearForRecord,
          startDate: periods[0]?.startDate ?? null,
          endDate: periods[periods.length - 1]?.endDate ?? null,
          packageName: input.packageName ?? null,
          note: input.note ?? null,
          createdById,
        },
        periods,
        items,
      );
      await activityRepo.log({
        planId: created.id,
        actorId: createdById,
        action: "PLAN_CREATED",
        entity: "PLAN",
        entityId: created.id,
        diff: { input, after: created, source: "template", templateId: input.templateId },
      });
      return created;
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

      const { periods, yearForRecord } = resolvePeriods(input, source.periodType);
      if (periods.length === 0) {
        throw new BadRequestError(
          "ไม่สามารถ generate periods ได้จากแผนต้นทาง — โปรดตรวจช่วงเดือน / periodType / customPeriods",
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

      const created = await repo.createPlanWithItems(
        {
          customerId,
          title: input.title,
          periodType: source.periodType,
          year: yearForRecord,
          startDate: periods[0]?.startDate ?? null,
          endDate: periods[periods.length - 1]?.endDate ?? null,
          packageName: input.packageName ?? null,
          note: input.note ?? null,
          createdById,
        },
        periods,
        items,
      );
      await activityRepo.log({
        planId: created.id,
        actorId: createdById,
        action: "PLAN_CREATED",
        entity: "PLAN",
        entityId: created.id,
        diff: { input, after: created, source: "clone", cloneFromPlanId: input.cloneFromPlanId },
      });
      return created;
    }

    // ───── Branch: empty plan (Phase 1 behavior) ─────────────
    const { periods, yearForRecord } = resolvePeriods(input, input.periodType);
    if (periods.length === 0) {
      throw new BadRequestError(
        "ไม่สามารถ generate periods ได้ — โปรดตรวจสอบช่วงเดือน / periodType / customPeriods",
      );
    }
    const created = await repo.createPlanWithPeriods(
      {
        customerId,
        title: input.title,
        periodType: input.periodType,
        year: yearForRecord,
        startDate: periods[0]?.startDate ?? null,
        endDate: periods[periods.length - 1]?.endDate ?? null,
        packageName: input.packageName ?? null,
        note: input.note ?? null,
        createdById,
      },
      periods,
    );
    await activityRepo.log({
      planId: created.id,
      actorId: createdById,
      action: "PLAN_CREATED",
      entity: "PLAN",
      entityId: created.id,
      diff: { input, after: created, source: "empty" },
    });
    return created;
  };
}
