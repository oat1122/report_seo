import {
  withApiHandler,
  ok,
} from "@/infrastructure/http";
import {
  updateCategory,
  updateCategorySchema,
  masterIdParamSchema,
} from "@/features/work-progress";
import { Role } from "@/types/auth";

export const PATCH = withApiHandler(
  {
    roles: [Role.ADMIN],
    params: masterIdParamSchema,
    body: updateCategorySchema,
  },
  async ({ params, body }) => ok(await updateCategory(params.id, body)),
);
