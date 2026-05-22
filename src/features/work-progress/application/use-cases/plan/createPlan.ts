import { BadRequestError } from "@/lib/errors";
import { createPlanSchema } from "../../../schemas";
import { generatePeriods } from "../../../domain/policies/period-generator";
import type { WorkProgressRepository } from "../../ports/WorkProgressRepository";

export function createPlanUseCase(repo: WorkProgressRepository) {
  return async (customerId: string, raw: unknown) => {
    const parsed = createPlanSchema.safeParse(raw);
    if (!parsed.success) {
      const detail = parsed.error.issues
        .map((i) => `${i.path.join(".") || "(root)"}: ${i.message}`)
        .join(", ");
      throw new BadRequestError(`Invalid plan data: ${detail}`);
    }
    const input = parsed.data;
    const periods = generatePeriods(input.periodType, {
      year: input.year,
      customPeriods: input.customPeriods,
    });
    if (periods.length === 0) {
      throw new BadRequestError("ไม่สามารถ generate periods ได้ — โปรดตรวจสอบ periodType / customPeriods");
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
      },
      periods,
    );
  };
}
