import { z } from "zod";
import { restoreUser } from "@/features/users";
import { withApiHandler, noContent } from "@/infrastructure/http";
import { Role } from "@/types/auth";

const idParamsSchema = z.object({ id: z.uuid() });

const handler = withApiHandler(
  { roles: [Role.ADMIN], params: idParamsSchema },
  async ({ params }) => {
    await restoreUser(params.id);
    return noContent();
  },
);

export const PUT = handler;
export const PATCH = handler;
