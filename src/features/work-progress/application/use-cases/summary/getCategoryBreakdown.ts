import {
  BadRequestError,
  ForbiddenError,
  NotFoundError,
} from "@/lib/errors";
import { categoryBreakdownQuerySchema } from "../../../schemas";
import type {
  WorkProgressRepository,
  CategoryBreakdownRow,
} from "../../ports/WorkProgressRepository";

export function getCategoryBreakdownUseCase(repo: WorkProgressRepository) {
  return async (
    customerId: string,
    planId: string,
    raw: unknown,
  ): Promise<CategoryBreakdownRow[]> => {
    const parsed = categoryBreakdownQuerySchema.safeParse(raw);
    if (!parsed.success) {
      const detail = parsed.error.issues
        .map((i) => `${i.path.join(".") || "(root)"}: ${i.message}`)
        .join(", ");
      throw new BadRequestError(`Invalid breakdown query: ${detail}`);
    }

    const plan = await repo.findById(planId);
    if (!plan) throw new NotFoundError("ไม่พบแผนงาน");
    if (plan.customerId !== customerId) {
      throw new ForbiddenError("ไม่มีสิทธิ์เข้าถึงแผนงานนี้");
    }

    return repo.getCategoryBreakdown(planId, {
      categoryId: parsed.data.categoryId,
    });
  };
}
