import { z } from "zod";
import {
  withApiHandler,
  customerAccessGuard,
  ok,
} from "@/infrastructure/http";
import { getPlanSummary } from "@/features/work-progress";

const paramsSchema = z.object({
  customerId: z.string().uuid(),
  planId: z.string().uuid(),
});

export const GET = withApiHandler(
  { params: paramsSchema },
  async ({ params }) => {
    const ctx = await customerAccessGuard(
      { byUserId: params.customerId },
      "read",
    );
    return ok(await getPlanSummary(ctx.customer.id, params.planId));
  },
);
