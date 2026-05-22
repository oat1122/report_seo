import { z } from "zod";
import {
  withApiHandler,
  customerAccessGuard,
  created,
} from "@/infrastructure/http";
import { addItem, addItemSchema } from "@/features/work-progress";

const paramsSchema = z.object({
  customerId: z.string().uuid(),
  planId: z.string().uuid(),
});

export const POST = withApiHandler(
  { params: paramsSchema, body: addItemSchema },
  async ({ params, body, session }) => {
    const ctx = await customerAccessGuard(
      { byUserId: params.customerId },
      "manage",
    );
    return created(
      await addItem(ctx.customer.id, params.planId, session.user.id, body),
    );
  },
);
