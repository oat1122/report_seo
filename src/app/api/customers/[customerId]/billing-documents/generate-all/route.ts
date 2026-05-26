import { z } from "zod";
import {
  withApiHandler,
  created,
  customerAccessGuard,
} from "@/infrastructure/http";
import {
  generateAllForCycle,
  generateAllForCycleSchema,
} from "@/features/billing-documents";

const paramsSchema = z.object({
  customerId: z.string().uuid(),
});

export const POST = withApiHandler(
  { params: paramsSchema, body: generateAllForCycleSchema },
  async ({ params, body }) => {
    const ctx = await customerAccessGuard(
      { byUserId: params.customerId },
      "manage",
    );
    const docs = await generateAllForCycle({
      customerId: ctx.customer.id,
      ...body,
    });
    return created(docs);
  },
);
