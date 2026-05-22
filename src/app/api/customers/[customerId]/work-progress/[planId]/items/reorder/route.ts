import { z } from "zod";
import {
  withApiHandler,
  customerAccessGuard,
  noContent,
} from "@/infrastructure/http";
import { reorderItems, reorderItemsSchema } from "@/features/work-progress";

const paramsSchema = z.object({
  customerId: z.string().uuid(),
  planId: z.string().uuid(),
});

export const POST = withApiHandler(
  { params: paramsSchema, body: reorderItemsSchema },
  async ({ params, body }) => {
    const ctx = await customerAccessGuard(
      { byUserId: params.customerId },
      "manage",
    );
    await reorderItems(ctx.customer.id, params.planId, body);
    return noContent();
  },
);
