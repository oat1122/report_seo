import { z } from "zod";
import {
  withApiHandler,
  customerAccessGuard,
  ok,
  created,
} from "@/infrastructure/http";
import {
  addRecommendation,
  listRecommendations,
  recommendKeywordSchema,
} from "@/features/recommendations";

const paramsSchema = z.object({ customerId: z.string().min(1) });

export const GET = withApiHandler(
  { params: paramsSchema },
  async ({ params }) => {
    const ctx = await customerAccessGuard({ byUserId: params.customerId }, "read");
    return ok(await listRecommendations(ctx.customer.id));
  },
);

export const POST = withApiHandler(
  { params: paramsSchema, body: recommendKeywordSchema },
  async ({ params, body }) => {
    const ctx = await customerAccessGuard({ byUserId: params.customerId }, "manage");
    return created(await addRecommendation(ctx.customer.id, body));
  },
);
