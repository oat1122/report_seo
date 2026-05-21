import { z } from "zod";
import {
  withApiHandler,
  ok,
  noContent,
} from "@/infrastructure/http";
import { ForbiddenError, NotFoundError } from "@/lib/errors";
import { Role } from "@/types/auth";
import {
  getUserById,
  softDeleteUser,
  updateUser,
  userSelfUpdateSchema,
  userUpdateSchema,
} from "@/features/users";

const idParamsSchema = z.object({ id: z.string().min(1) });

export const GET = withApiHandler(
  { params: idParamsSchema },
  async ({ session, params }) => {
    const isOwner = session.user.id === params.id;
    const isAdmin = session.user.role === Role.ADMIN;
    if (!isOwner && !isAdmin) throw new ForbiddenError();

    const user = await getUserById(params.id, { includeAdminFields: isAdmin });
    if (!user) throw new NotFoundError("User not found");
    return ok(user);
  },
);

export const PUT = withApiHandler(
  { params: idParamsSchema },
  async ({ req, session, params }) => {
    const isOwner = session.user.id === params.id;
    const isAdmin = session.user.role === Role.ADMIN;
    if (!isOwner && !isAdmin) throw new ForbiddenError();

    const raw = await req.json();
    const input = isAdmin
      ? userUpdateSchema.parse(raw)
      : userSelfUpdateSchema.parse(raw);
    return ok(await updateUser(params.id, input));
  },
);

export const DELETE = withApiHandler(
  { roles: [Role.ADMIN], params: idParamsSchema },
  async ({ params }) => {
    await softDeleteUser(params.id);
    return noContent();
  },
);
