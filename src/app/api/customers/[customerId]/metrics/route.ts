import { z } from "zod";
import {
  withApiHandler,
  customerAccessGuard,
  ok,
  created,
} from "@/infrastructure/http";
import { getMetrics, metricsSchema, saveMetrics } from "@/features/metrics";

const paramsSchema = z.object({ customerId: z.uuid() });

export const GET = withApiHandler(
  { params: paramsSchema },
  async ({ params }) => {
    const ctx = await customerAccessGuard({ byUserId: params.customerId }, "read");
    return ok(await getMetrics(ctx.customer.id));
  },
);

export const POST = withApiHandler(
  { params: paramsSchema, body: metricsSchema },
  async ({ params, body }) => {
    const ctx = await customerAccessGuard({ byUserId: params.customerId }, "manage");
    return created(await saveMetrics(ctx.customer.id, body));
  },
);
