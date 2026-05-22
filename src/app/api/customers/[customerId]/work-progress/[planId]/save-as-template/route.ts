import { z } from "zod";
import {
  withApiHandler,
  customerAccessGuard,
  created,
} from "@/infrastructure/http";
import {
  savePlanAsTemplate,
  savePlanAsTemplateSchema,
} from "@/features/work-progress";
import { Role } from "@/types/auth";

const paramsSchema = z.object({
  customerId: z.string().uuid(),
  planId: z.string().uuid(),
});

export const POST = withApiHandler(
  {
    roles: [Role.ADMIN],
    params: paramsSchema,
    body: savePlanAsTemplateSchema,
  },
  async ({ params, body, session }) => {
    const ctx = await customerAccessGuard(
      { byUserId: params.customerId },
      "read",
    );
    return created(
      await savePlanAsTemplate(
        ctx.customer.id,
        params.planId,
        session.user.id,
        body,
      ),
    );
  },
);
