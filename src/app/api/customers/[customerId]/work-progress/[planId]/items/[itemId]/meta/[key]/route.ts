import { z } from "zod";
import {
  withApiHandler,
  customerAccessGuard,
  noContent,
} from "@/infrastructure/http";
import { deleteMeta } from "@/features/work-progress";

const paramsSchema = z.object({
  customerId: z.string().uuid(),
  planId: z.string().uuid(),
  itemId: z.string().uuid(),
  key: z
    .string()
    .min(1)
    .max(100)
    .regex(/^[a-zA-Z0-9_.-]+$/),
});

export const DELETE = withApiHandler(
  { params: paramsSchema },
  async ({ params }) => {
    const ctx = await customerAccessGuard(
      { byUserId: params.customerId },
      "manage",
    );
    await deleteMeta(
      ctx.customer.id,
      params.planId,
      params.itemId,
      params.key,
    );
    return noContent();
  },
);
