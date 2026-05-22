import {
  BadRequestError,
  ForbiddenError,
  NotFoundError,
} from "@/lib/errors";
import { addSubtaskSchema } from "../../../schemas";
import type { WorkProgressRepository } from "../../ports/WorkProgressRepository";
import type { WorkProgressSubtaskRepository } from "../../ports/WorkProgressSubtaskRepository";
import {
  assertAssigneeAllowed,
  type AssigneeLookup,
} from "../../policies/assignee-guard";

export function addSubtaskUseCase(
  repo: WorkProgressRepository,
  subtaskRepo: WorkProgressSubtaskRepository,
  lookupAssignee: AssigneeLookup,
) {
  return async (
    customerId: string,
    planId: string,
    itemId: string,
    customerSeoDevId: string | null,
    raw: unknown,
  ) => {
    const parsed = addSubtaskSchema.safeParse(raw);
    if (!parsed.success) {
      const detail = parsed.error.issues
        .map((i) => `${i.path.join(".") || "(root)"}: ${i.message}`)
        .join(", ");
      throw new BadRequestError(`Invalid subtask data: ${detail}`);
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

    const assignedToId = input.assignedToId ?? null;
    if (assignedToId !== null) {
      await assertAssigneeAllowed(
        assignedToId,
        customerSeoDevId,
        lookupAssignee,
      );
    }

    return subtaskRepo.add({
      itemId,
      title: input.title,
      assignedToId,
      orderIndex: input.orderIndex ?? null,
    });
  };
}
