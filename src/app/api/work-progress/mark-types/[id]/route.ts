import { withApiHandler, ok } from "@/infrastructure/http";
import {
  updateMarkType,
  updateMarkTypeSchema,
  masterIdParamSchema,
} from "@/features/work-progress";
import { Role } from "@/types/auth";

export const PATCH = withApiHandler(
  {
    roles: [Role.ADMIN],
    params: masterIdParamSchema,
    body: updateMarkTypeSchema,
  },
  async ({ params, body }) => ok(await updateMarkType(params.id, body)),
);
