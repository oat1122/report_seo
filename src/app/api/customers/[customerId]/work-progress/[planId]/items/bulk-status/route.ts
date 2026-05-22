import { z } from "zod";
import {
  withApiHandler,
  customerAccessGuard,
  ok,
} from "@/infrastructure/http";
import {
  bulkUpdateItemStatus,
  bulkUpdateItemStatusSchema,
} from "@/features/work-progress";

const paramsSchema = z.object({
  customerId: z.string().uuid(),
  planId: z.string().uuid(),
});

export const POST = withApiHandler(
  { params: paramsSchema, body: bulkUpdateItemStatusSchema },
  async ({ params, body, session }) => {
    const ctx = await customerAccessGuard(
      { byUserId: params.customerId },
      "manage",
    );
    return ok(
      await bulkUpdateItemStatus(
        ctx.customer.id,
        params.planId,
        session.user.id,
        body,
      ),
    );
  },
);
