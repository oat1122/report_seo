import { z } from "zod";
import {
  withApiHandler,
  customerAccessGuard,
  ok,
  created,
} from "@/infrastructure/http";
import {
  createPaymentPlan,
  createPaymentPlanSchema,
  listPaymentPlans,
  listPaymentPlansQuerySchema,
} from "@/features/payments";

const paramsSchema = z.object({ customerId: z.string().uuid() });

export const GET = withApiHandler(
  { params: paramsSchema, query: listPaymentPlansQuerySchema },
  async ({ params, query }) => {
    const ctx = await customerAccessGuard(
      { byUserId: params.customerId },
      "read",
    );
    return ok(await listPaymentPlans(ctx.customer.id, query));
  },
);

export const POST = withApiHandler(
  { params: paramsSchema, body: createPaymentPlanSchema },
  async ({ params, body }) => {
    const ctx = await customerAccessGuard(
      { byUserId: params.customerId },
      "manage",
    );
    return created(await createPaymentPlan(ctx.customer.id, body));
  },
);
