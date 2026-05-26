import { z } from "zod";
import {
  withApiHandler,
  ok,
  customerAccessGuard,
} from "@/infrastructure/http";
import {
  listDocumentItems,
  upsertDocumentItems,
  upsertDocumentItemsSchema,
} from "@/features/billing-documents";

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
    return ok(await listDocumentItems(ctx.customer.id));
  },
);

export const PUT = withApiHandler(
  { params: paramsSchema, body: upsertDocumentItemsSchema },
  async ({ params, body }) => {
    const ctx = await customerAccessGuard(
      { byUserId: params.customerId },
      "manage",
    );
    return ok(await upsertDocumentItems(ctx.customer.id, body.items));
  },
);
