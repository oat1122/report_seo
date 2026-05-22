import { z } from "zod";
import { withApiHandler, ok, noContent } from "@/infrastructure/http";
import {
  deleteTemplateItemSubtask,
  updateTemplateItemSubtask,
  updateTemplateSubtaskSchema,
} from "@/features/work-progress";
import { Role } from "@/types/auth";

const paramsSchema = z.object({
  id: z.string().uuid(),
  itemId: z.string().uuid(),
  subtaskId: z.string().uuid(),
});

export const PATCH = withApiHandler(
  {
    roles: [Role.ADMIN],
    params: paramsSchema,
    body: updateTemplateSubtaskSchema,
  },
  async ({ params, body }) =>
    ok(
      await updateTemplateItemSubtask(
        params.id,
        params.itemId,
        params.subtaskId,
        body,
      ),
    ),
);

export const DELETE = withApiHandler(
  { roles: [Role.ADMIN], params: paramsSchema },
  async ({ params }) => {
    await deleteTemplateItemSubtask(
      params.id,
      params.itemId,
      params.subtaskId,
    );
    return noContent();
  },
);
