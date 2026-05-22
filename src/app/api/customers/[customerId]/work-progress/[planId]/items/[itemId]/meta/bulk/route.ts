import { z } from "zod";
import {
  withApiHandler,
  customerAccessGuard,
  ok,
} from "@/infrastructure/http";
import {
  bulkUpsertMeta,
  bulkUpsertMetaSchema,
} from "@/features/work-progress";

const paramsSchema = z.object({
  customerId: z.string().uuid(),
  planId: z.string().uuid(),
  itemId: z.string().uuid(),
});

export const POST = withApiHandler(
  { params: paramsSchema, body: bulkUpsertMetaSchema },
  async ({ params, body, session }) => {
    const ctx = await customerAccessGuard(
      { byUserId: params.customerId },
      "manage",
    );
    return ok(
      await bulkUpsertMeta(
        ctx.customer.id,
        params.planId,
        params.itemId,
        session.user.id,
        body,
      ),
    );
  },
);
