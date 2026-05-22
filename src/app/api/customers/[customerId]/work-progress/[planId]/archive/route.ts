import { z } from "zod";
import {
  withApiHandler,
  customerAccessGuard,
  ok,
} from "@/infrastructure/http";
import { archivePlan } from "@/features/work-progress";

const paramsSchema = z.object({
  customerId: z.string().uuid(),
  planId: z.string().uuid(),
});

const bodySchema = z.object({ isArchived: z.boolean().optional().default(true) });

export const POST = withApiHandler(
  { params: paramsSchema, body: bodySchema },
  async ({ params, body }) => {
    const ctx = await customerAccessGuard(
      { byUserId: params.customerId },
      "manage",
    );
    return ok(
      await archivePlan(ctx.customer.id, params.planId, {
        isArchived: body.isArchived,
      }),
    );
  },
);
