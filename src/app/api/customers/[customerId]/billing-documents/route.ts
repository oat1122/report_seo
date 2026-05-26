import { z } from "zod";
import {
  withApiHandler,
  ok,
  customerAccessGuard,
} from "@/infrastructure/http";
import { listDocuments } from "@/features/billing-documents";
import type { BillingDocumentType } from "@/features/billing-documents";

const paramsSchema = z.object({
  customerId: z.string().uuid(),
});

const querySchema = z.object({
  type: z
    .enum(["BILLING_NOTE", "INVOICE", "RECEIPT", "TAX_INVOICE"])
    .optional(),
});

export const GET = withApiHandler(
  { params: paramsSchema, query: querySchema },
  async ({ params, query }) => {
    const ctx = await customerAccessGuard(
      { byUserId: params.customerId },
      "manage",
    );
    return ok(
      await listDocuments(
        ctx.customer.id,
        query.type as BillingDocumentType | undefined,
      ),
    );
  },
);
