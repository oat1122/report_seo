import { withApiHandler, ok } from "@/infrastructure/http";
import {
  updateStatus,
  updateStatusSchema,
  masterIdParamSchema,
} from "@/features/work-progress";
import { Role } from "@/types/auth";

export const PATCH = withApiHandler(
  {
    roles: [Role.ADMIN],
    params: masterIdParamSchema,
    body: updateStatusSchema,
  },
  async ({ params, body }) => ok(await updateStatus(params.id, body)),
);
