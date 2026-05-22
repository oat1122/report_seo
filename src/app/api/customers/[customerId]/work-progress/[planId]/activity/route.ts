import { z } from "zod";
import {
  withApiHandler,
  customerAccessGuard,
  ok,
} from "@/infrastructure/http";
import {
  activityLogQuerySchema,
  getActivityLog,
} from "@/features/work-progress";

const paramsSchema = z.object({
  customerId: z.string().uuid(),
  planId: z.string().uuid(),
});

export const GET = withApiHandler(
  { params: paramsSchema, query: activityLogQuerySchema },
  async ({ params, query }) => {
    const ctx = await customerAccessGuard(
      { byUserId: params.customerId },
      "read",
    );
    return ok(await getActivityLog(ctx.customer.id, params.planId, query));
  },
);
