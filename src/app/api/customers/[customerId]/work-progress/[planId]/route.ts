import { z } from "zod";
import {
  withApiHandler,
  customerAccessGuard,
  ok,
  noContent,
} from "@/infrastructure/http";
import {
  deletePlan,
  getPlanDetail,
  updatePlan,
  updatePlanSchema,
} from "@/features/work-progress";

const paramsSchema = z.object({
  customerId: z.string().uuid(),
  planId: z.string().uuid(),
});

export const GET = withApiHandler(
  { params: paramsSchema },
  async ({ params }) => {
    const ctx = await customerAccessGuard(
      { byUserId: params.customerId },
      "read",
    );
    return ok(await getPlanDetail(ctx.customer.id, params.planId));
  },
);

export const PATCH = withApiHandler(
  { params: paramsSchema, body: updatePlanSchema },
  async ({ params, body }) => {
    const ctx = await customerAccessGuard(
      { byUserId: params.customerId },
      "manage",
    );
    return ok(await updatePlan(ctx.customer.id, params.planId, body));
  },
);

export const DELETE = withApiHandler(
  { params: paramsSchema },
  async ({ params }) => {
    const ctx = await customerAccessGuard(
      { byUserId: params.customerId },
      "manage",
    );
    await deletePlan(ctx.customer.id, params.planId);
    return noContent();
  },
);
