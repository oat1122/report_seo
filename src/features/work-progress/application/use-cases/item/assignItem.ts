import {
  BadRequestError,
  ForbiddenError,
  NotFoundError,
} from "@/lib/errors";
import { assignItemSchema } from "../../../schemas";
import type { WorkProgressRepository } from "../../ports/WorkProgressRepository";
import {
  assertAssigneeAllowed,
  type AssigneeLookup,
} from "../../policies/assignee-guard";

export function assignItemUseCase(
  repo: WorkProgressRepository,
  lookupAssignee: AssigneeLookup,
) {
  return async (
    customerId: string,
    planId: string,
    itemId: string,
    customerSeoDevId: string | null,
    raw: unknown,
  ) => {
    const parsed = assignItemSchema.safeParse(raw);
    if (!parsed.success) {
      const detail = parsed.error.issues
        .map((i) => `${i.path.join(".") || "(root)"}: ${i.message}`)
        .join(", ");
      throw new BadRequestError(`Invalid assign data: ${detail}`);
    }
    const { assignedToId } = parsed.data;

    const item = await repo.findItemById(itemId);
    if (!item) throw new NotFoundError("ไม่พบรายการ");
    if (item.planId !== planId) {
      throw new ForbiddenError("รายการไม่อยู่ในแผนงานที่ระบุ");
    }
    const plan = await repo.findById(planId);
    if (!plan || plan.customerId !== customerId) {
      throw new ForbiddenError("ไม่มีสิทธิ์แก้ไขแผนงานนี้");
    }

    if (assignedToId !== null) {
      await assertAssigneeAllowed(
        assignedToId,
        customerSeoDevId,
        lookupAssignee,
      );
    }

    return repo.assignItem(itemId, assignedToId);
  };
}
