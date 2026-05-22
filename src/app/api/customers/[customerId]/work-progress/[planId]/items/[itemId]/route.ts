import { z } from "zod";
import {
  withApiHandler,
  customerAccessGuard,
  ok,
  noContent,
} from "@/infrastructure/http";
import {
  deleteItem,
  updateItem,
  updateItemSchema,
} from "@/features/work-progress";

const paramsSchema = z.object({
  customerId: z.string().uuid(),
  planId: z.string().uuid(),
  itemId: z.string().uuid(),
});

export const PATCH = withApiHandler(
  { params: paramsSchema, body: updateItemSchema },
  async ({ params, body, session }) => {
    const ctx = await customerAccessGuard(
      { byUserId: params.customerId },
      "manage",
    );
    return ok(
      await updateItem(
        ctx.customer.id,
        params.planId,
        params.itemId,
        session.user.id,
        body,
      ),
    );
  },
);

export const DELETE = withApiHandler(
  { params: paramsSchema },
  async ({ params, session }) => {
    const ctx = await customerAccessGuard(
      { byUserId: params.customerId },
      "manage",
    );
    await deleteItem(
      ctx.customer.id,
      params.planId,
      params.itemId,
      session.user.id,
    );
    return noContent();
  },
);
