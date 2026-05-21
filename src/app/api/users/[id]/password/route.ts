import { NextResponse } from "next/server";
import { changePassword } from "@/features/users";
import { requireSession } from "@/infrastructure/auth/session";
import { toErrorResponse } from "@/lib/http";
import { BadRequestError, ForbiddenError } from "@/lib/errors";
import { Role } from "@/types/auth";

async function handler(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await requireSession();
    const { id } = await params;
    const { currentPassword, newPassword, confirmPassword } = await req.json();

    const isOwner = session.user.id === id;
    const isAdmin = session.user.role === Role.ADMIN;

    if (!isAdmin && !isOwner) {
      throw new ForbiddenError();
    }

    if (newPassword !== confirmPassword) {
      throw new BadRequestError("New passwords do not match");
    }

    await changePassword(id, currentPassword, newPassword, isAdmin);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return toErrorResponse(error);
  }
}

export const PUT = handler;
export const PATCH = handler;
