import { z } from "zod";
import {
  withApiHandler,
  customerAccessGuard,
  ok,
} from "@/infrastructure/http";
import {
  bulkSetPeriodMarks,
  bulkSetPeriodMarksSchema,
} from "@/features/work-progress";

const paramsSchema = z.object({
  customerId: z.string().uuid(),
  planId: z.string().uuid(),
  itemId: z.string().uuid(),
});

export const POST = withApiHandler(
  { params: paramsSchema, body: bulkSetPeriodMarksSchema },
  async ({ params, body }) => {
    const ctx = await customerAccessGuard(
      { byUserId: params.customerId },
      "manage",
    );
    return ok(
      await bulkSetPeriodMarks(
        ctx.customer.id,
        params.planId,
        params.itemId,
        body,
      ),
    );
  },
);
