import { NextResponse } from "next/server";
import { requireRole, requireSession } from "@/infrastructure/auth/session";
import { toErrorResponse } from "@/lib/http";
import { ForbiddenError, NotFoundError } from "@/lib/errors";
import { Role } from "@/types/auth";
import {
  getUserById,
  softDeleteUser,
  updateUser,
  userSelfUpdateSchema,
  userUpdateSchema,
} from "@/features/users";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await requireSession();
    const { id } = await params;
    const isOwner = session.user.id === id;
    const isAdmin = session.user.role === Role.ADMIN;

    if (!isOwner && !isAdmin) {
      throw new ForbiddenError();
    }

    const user = await getUserById(id, { includeAdminFields: isAdmin });
    if (!user) {
      throw new NotFoundError("User not found");
    }
    return NextResponse.json(user);
  } catch (error) {
    return toErrorResponse(error);
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await requireSession();
    const { id } = await params;
    const isOwner = session.user.id === id;
    const isAdmin = session.user.role === Role.ADMIN;

    if (!isOwner && !isAdmin) {
      throw new ForbiddenError();
    }

    const body = await request.json();
    const input = isAdmin
      ? userUpdateSchema.parse(body)
      : userSelfUpdateSchema.parse(body);
    return NextResponse.json(await updateUser(id, input));
  } catch (error) {
    return toErrorResponse(error);
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireRole([Role.ADMIN]);
    const { id } = await params;
    await softDeleteUser(id);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return toErrorResponse(error);
  }
}
