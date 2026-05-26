import { z } from "zod";
import {
  withApiHandler,
  ok,
  customerAccessGuard,
} from "@/infrastructure/http";
import { listDocumentsByCycles } from "@/features/billing-documents";

const paramsSchema = z.object({
  customerId: z.string().uuid(),
});

export const GET = withApiHandler(
  { params: paramsSchema },
  async ({ params }) => {
    const ctx = await customerAccessGuard(
      { byUserId: params.customerId },
      "manage",
    );
    const docs = await listDocumentsByCycles(ctx.customer.id);
    return ok(docs);
  },
);
