import { z } from "zod";
import { withApiHandler, created } from "@/infrastructure/http";
import {
  addTemplateItemSubtask,
  addTemplateSubtaskSchema,
} from "@/features/work-progress";
import { Role } from "@/types/auth";

const paramsSchema = z.object({
  id: z.string().uuid(),
  itemId: z.string().uuid(),
});

export const POST = withApiHandler(
  {
    roles: [Role.ADMIN],
    params: paramsSchema,
    body: addTemplateSubtaskSchema,
  },
  async ({ params, body }) =>
    created(await addTemplateItemSubtask(params.id, params.itemId, body)),
);
