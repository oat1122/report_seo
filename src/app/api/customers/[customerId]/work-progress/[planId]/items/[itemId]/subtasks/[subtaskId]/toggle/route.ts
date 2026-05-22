import { z } from "zod";
import {
  withApiHandler,
  customerAccessGuard,
  ok,
} from "@/infrastructure/http";
import { toggleSubtask } from "@/features/work-progress";

const paramsSchema = z.object({
  customerId: z.string().uuid(),
  planId: z.string().uuid(),
  itemId: z.string().uuid(),
  subtaskId: z.string().uuid(),
});

export const POST = withApiHandler(
  { params: paramsSchema },
  async ({ params, session }) => {
    const ctx = await customerAccessGuard(
      { byUserId: params.customerId },
      "manage",
    );
    return ok(
      await toggleSubtask(
        ctx.customer.id,
        params.planId,
        params.itemId,
        params.subtaskId,
        session.user.id,
      ),
    );
  },
);
