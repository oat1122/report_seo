import { z } from "zod";
import { changePassword } from "@/features/users";
import {
  withApiHandler,
  noContent,
} from "@/infrastructure/http";
import { BadRequestError, ForbiddenError } from "@/lib/errors";
import { Role } from "@/types/auth";

const idParamsSchema = z.object({ id: z.string().min(1) });
const passwordBodySchema = z
  .object({
    currentPassword: z.string().optional(),
    newPassword: z.string().min(6, "New password must be at least 6 characters"),
    confirmPassword: z.string().min(1, "Confirm password is required"),
  })
  .strict();

const handler = withApiHandler(
  { params: idParamsSchema, body: passwordBodySchema },
  async ({ session, params, body }) => {
    const isOwner = session.user.id === params.id;
    const isAdmin = session.user.role === Role.ADMIN;
    if (!isAdmin && !isOwner) throw new ForbiddenError();
    if (body.newPassword !== body.confirmPassword) {
      throw new BadRequestError("New passwords do not match");
    }
    await changePassword(params.id, body.currentPassword, body.newPassword, isAdmin);
    return noContent();
  },
);

export const PUT = handler;
export const PATCH = handler;
