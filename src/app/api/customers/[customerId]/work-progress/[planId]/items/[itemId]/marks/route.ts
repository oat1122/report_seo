import { z } from "zod";
import {
  withApiHandler,
  customerAccessGuard,
  ok,
} from "@/infrastructure/http";
import {
  setPeriodMark,
  setPeriodMarkSchema,
} from "@/features/work-progress";

const paramsSchema = z.object({
  customerId: z.string().uuid(),
  planId: z.string().uuid(),
  itemId: z.string().uuid(),
});

export const PUT = withApiHandler(
  { params: paramsSchema, body: setPeriodMarkSchema },
  async ({ params, body }) => {
    const ctx = await customerAccessGuard(
      { byUserId: params.customerId },
      "manage",
    );
    return ok(
      await setPeriodMark(
        ctx.customer.id,
        params.planId,
        params.itemId,
        body,
      ),
    );
  },
);
