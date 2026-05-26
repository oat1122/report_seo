import { z } from "zod";
import {
  withApiHandler,
  ok,
  noContent,
  customerAccessGuard,
} from "@/infrastructure/http";
import {
  getDocument,
  deleteDocument,
} from "@/features/billing-documents";
import { NotFoundError } from "@/lib/errors";

const paramsSchema = z.object({
  customerId: z.string().uuid(),
  documentId: z.string().uuid(),
});

export const GET = withApiHandler(
  { params: paramsSchema },
  async ({ params }) => {
    await customerAccessGuard(
      { byUserId: params.customerId },
      "manage",
    );
    const doc = await getDocument(params.documentId);
    if (!doc) throw new NotFoundError("ไม่พบเอกสาร");
    return ok(doc);
  },
);

export const DELETE = withApiHandler(
  { params: paramsSchema },
  async ({ params }) => {
    await customerAccessGuard(
      { byUserId: params.customerId },
      "manage",
    );
    await deleteDocument(params.documentId);
    return noContent();
  },
);
