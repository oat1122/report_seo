import { z } from "zod";
import {
  withApiHandler,
  customerAccessGuard,
  ok,
  noContent,
} from "@/infrastructure/http";
import {
  deleteSubtask,
  updateSubtask,
  updateSubtaskSchema,
} from "@/features/work-progress";

const paramsSchema = z.object({
  customerId: z.string().uuid(),
  planId: z.string().uuid(),
  itemId: z.string().uuid(),
  subtaskId: z.string().uuid(),
});

export const PATCH = withApiHandler(
  { params: paramsSchema, body: updateSubtaskSchema },
  async ({ params, body, session }) => {
    const ctx = await customerAccessGuard(
      { byUserId: params.customerId },
      "manage",
    );
    return ok(
      await updateSubtask(
        ctx.customer.id,
        params.planId,
        params.itemId,
        params.subtaskId,
        ctx.customer.seoDevId,
        session.user.id,
        body,
      ),
    );
  },
);

export const DELETE = withApiHandler(
  { params: paramsSchema },
  async ({ params, session }) => {
    const ctx = await customerAccessGuard(
      { byUserId: params.customerId },
      "manage",
    );
    await deleteSubtask(
      ctx.customer.id,
      params.planId,
      params.itemId,
      params.subtaskId,
      session.user.id,
    );
    return noContent();
  },
);
