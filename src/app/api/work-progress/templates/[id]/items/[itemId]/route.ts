import { z } from "zod";
import { withApiHandler, ok, noContent } from "@/infrastructure/http";
import {
  deleteTemplateItem,
  updateTemplateItem,
  updateTemplateItemSchema,
} from "@/features/work-progress";
import { Role } from "@/types/auth";

const paramsSchema = z.object({
  id: z.string().uuid(),
  itemId: z.string().uuid(),
});

export const PATCH = withApiHandler(
  {
    roles: [Role.ADMIN],
    params: paramsSchema,
    body: updateTemplateItemSchema,
  },
  async ({ params, body }) =>
    ok(await updateTemplateItem(params.id, params.itemId, body)),
);

export const DELETE = withApiHandler(
  { roles: [Role.ADMIN], params: paramsSchema },
  async ({ params }) => {
    await deleteTemplateItem(params.id, params.itemId);
    return noContent();
  },
);
