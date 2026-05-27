import { z } from "zod";
import { withApiHandler, ok } from "@/infrastructure/http";
import { Role } from "@/types/auth";
import {
  upsertDocumentTemplateItems,
  upsertTemplateItemsSchema,
} from "@/features/billing-documents";

const paramsSchema = z.object({
  templateId: z.string().uuid(),
});

export const PUT = withApiHandler(
  { roles: [Role.ADMIN], params: paramsSchema, body: upsertTemplateItemsSchema },
  async ({ params, body }) => {
    return ok(
      await upsertDocumentTemplateItems(params.templateId, body.items),
    );
  },
);
