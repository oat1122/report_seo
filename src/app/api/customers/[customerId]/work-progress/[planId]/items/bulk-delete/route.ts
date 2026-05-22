import { z } from "zod";
import {
  withApiHandler,
  customerAccessGuard,
  ok,
} from "@/infrastructure/http";
import {
  bulkDeleteItems,
  bulkDeleteItemsSchema,
} from "@/features/work-progress";

const paramsSchema = z.object({
  customerId: z.string().uuid(),
  planId: z.string().uuid(),
});

export const POST = withApiHandler(
  { params: paramsSchema, body: bulkDeleteItemsSchema },
  async ({ params, body, session }) => {
    const ctx = await customerAccessGuard(
      { byUserId: params.customerId },
      "manage",
    );
    return ok(
      await bulkDeleteItems(
        ctx.customer.id,
        params.planId,
        session.user.id,
        body,
      ),
    );
  },
);
