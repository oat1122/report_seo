import { z } from "zod";
import {
  withApiHandler,
  customerAccessGuard,
  ok,
  noContent,
} from "@/infrastructure/http";
import {
  deleteRecommendation,
  recommendKeywordSchema,
  updateRecommendation,
} from "@/features/recommendations";

const paramsSchema = z.object({ recommendId: z.string().min(1) });

export const PUT = withApiHandler(
  { params: paramsSchema, body: recommendKeywordSchema },
  async ({ params, body }) => {
    await customerAccessGuard({ byRecommendId: params.recommendId }, "manage");
    return ok(await updateRecommendation(params.recommendId, body));
  },
);

export const DELETE = withApiHandler(
  { params: paramsSchema },
  async ({ params }) => {
    await customerAccessGuard({ byRecommendId: params.recommendId }, "manage");
    await deleteRecommendation(params.recommendId);
    return noContent();
  },
);
