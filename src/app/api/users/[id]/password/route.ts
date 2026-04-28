import { NextResponse } from "next/server";
import { userService } from "@/services/UserService";
import { requireSession } from "@/lib/api-auth";
import { toErrorResponse } from "@/lib/http";
import { BadRequestError, ForbiddenError } from "@/lib/errors";
import { Role } from "@/types/auth";

async function updatePasswordHandler(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const auth = await requireSession();
    if (auth.response || !auth.session) {
      return auth.response;
    }

    const { id } = await params;
    const { currentPassword, newPassword, confirmPassword } = await req.json();

    const isOwner = auth.session.user.id === id;
    const isAdmin = auth.session.user.role === Role.ADMIN;

    if (!isAdmin && !isOwner) {
      throw new ForbiddenError();
    }

    if (newPassword !== confirmPassword) {
      throw new BadRequestError("New passwords do not match");
    }

    await userService.updatePassword(id, currentPassword, newPassword, isAdmin);

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return toErrorResponse(error);
  }
}

export const PUT = updatePasswordHandler;
export const PATCH = updatePasswordHandler;
