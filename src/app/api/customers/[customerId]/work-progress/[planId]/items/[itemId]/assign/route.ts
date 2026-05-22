import { z } from "zod";
import {
  withApiHandler,
  customerAccessGuard,
  ok,
} from "@/infrastructure/http";
import { assignItem, assignItemSchema } from "@/features/work-progress";

const paramsSchema = z.object({
  customerId: z.string().uuid(),
  planId: z.string().uuid(),
  itemId: z.string().uuid(),
});

export const POST = withApiHandler(
  { params: paramsSchema, body: assignItemSchema },
  async ({ params, body, session }) => {
    const ctx = await customerAccessGuard(
      { byUserId: params.customerId },
      "manage",
    );
    return ok(
      await assignItem(
        ctx.customer.id,
        params.planId,
        params.itemId,
        ctx.customer.seoDevId,
        session.user.id,
        body,
      ),
    );
  },
);
