import { z } from "zod";
import { withApiHandler, ok, created } from "@/infrastructure/http";
import { createUser, listUsers, userCreateSchema } from "@/features/users";
import { Role } from "@/types/auth";

const listUsersQuerySchema = z.object({
  includeDeleted: z
    .union([z.literal("true"), z.literal("false")])
    .optional()
    .transform((v) => v === "true"),
});

export const GET = withApiHandler(
  { roles: [Role.ADMIN], query: listUsersQuerySchema },
  async ({ query }) => ok(await listUsers(query.includeDeleted)),
);

export const POST = withApiHandler(
  { roles: [Role.ADMIN], body: userCreateSchema },
  async ({ body }) => created(await createUser(body)),
);
