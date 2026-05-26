import { z } from "zod";
import {
  withApiHandler,
  customerAccessGuard,
  ok,
} from "@/infrastructure/http";
import {
  approveRejectProof,
  updateProofStatusSchema,
} from "@/features/payments";

const paramsSchema = z.object({
  customerId: z.string().uuid(),
  proofId: z.string().uuid(),
});

export const PATCH = withApiHandler(
  { params: paramsSchema, body: updateProofStatusSchema },
  async ({ params, body }) => {
    await customerAccessGuard({ byUserId: params.customerId }, "manage");
    return ok(await approveRejectProof(params.proofId, body.status));
  },
);
