import { withApiHandler, noContent } from "@/infrastructure/http";
import {
  reorderTemplateItems,
  reorderTemplateItemsSchema,
  templateIdParamSchema,
} from "@/features/work-progress";
import { Role } from "@/types/auth";

export const POST = withApiHandler(
  {
    roles: [Role.ADMIN],
    params: templateIdParamSchema,
    body: reorderTemplateItemsSchema,
  },
  async ({ params, body }) => {
    await reorderTemplateItems(params.id, body);
    return noContent();
  },
);
