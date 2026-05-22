import { z } from "zod";
import {
  withApiHandler,
  customerAccessGuard,
  created,
} from "@/infrastructure/http";
import { addSubtask, addSubtaskSchema } from "@/features/work-progress";

const paramsSchema = z.object({
  customerId: z.string().uuid(),
  planId: z.string().uuid(),
  itemId: z.string().uuid(),
});

export const POST = withApiHandler(
  { params: paramsSchema, body: addSubtaskSchema },
  async ({ params, body, session }) => {
    const ctx = await customerAccessGuard(
      { byUserId: params.customerId },
      "manage",
    );
    return created(
      await addSubtask(
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
