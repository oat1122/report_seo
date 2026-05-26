import { z } from "zod";
import {
  withApiHandler,
  noContent,
  customerAccessGuard,
} from "@/infrastructure/http";
import { deleteDocumentItem } from "@/features/billing-documents";

const paramsSchema = z.object({
  customerId: z.string().uuid(),
  itemId: z.string().uuid(),
});

export const DELETE = withApiHandler(
  { params: paramsSchema },
  async ({ params }) => {
    await customerAccessGuard(
      { byUserId: params.customerId },
      "manage",
    );
    await deleteDocumentItem(params.itemId);
    return noContent();
  },
);
