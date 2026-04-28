import { NextResponse } from "next/server";
import { requireAdminOnly, requireSession } from "@/lib/api-auth";
import { toErrorResponse } from "@/lib/http";
import { ForbiddenError, NotFoundError } from "@/lib/errors";
import { Role } from "@/types/auth";
import { userService } from "@/services/UserService";

const sanitizeSelfUpdate = (body: Record<string, unknown>) => ({
  name: typeof body.name === "string" ? body.name : undefined,
  email: typeof body.email === "string" ? body.email : undefined,
});

// GET /api/users/[id]
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const auth = await requireSession();
    if (auth.response || !auth.session) {
      return auth.response;
    }

    const { id } = await params;
    const isOwner = auth.session.user.id === id;

    if (!isOwner) {
      const roleError = requireAdminOnly(auth.session);
      if (roleError) {
        return roleError;
      }
    }

    const user = await userService.getUserById(id);
    if (!user) {
      throw new NotFoundError("User not found");
    }
    return NextResponse.json(user);
  } catch (error) {
    return toErrorResponse(error);
  }
}

// PUT /api/users/[id]
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const auth = await requireSession();
    if (auth.response || !auth.session) {
      return auth.response;
    }

    const { id } = await params;
    const body = (await request.json()) as Record<string, unknown>;
    const isOwner = auth.session.user.id === id;
    const isAdmin = auth.session.user.role === Role.ADMIN;

    if (!isOwner && !isAdmin) {
      throw new ForbiddenError();
    }

    const updatedUser = await userService.updateUser(
      id,
      isAdmin ? body : sanitizeSelfUpdate(body),
    );
    return NextResponse.json(updatedUser);
  } catch (error) {
    return toErrorResponse(error);
  }
}

// DELETE /api/users/[id]
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const auth = await requireSession();
    if (auth.response || !auth.session) {
      return auth.response;
    }

    const roleError = requireAdminOnly(auth.session);
    if (roleError) {
      return roleError;
    }

    const { id } = await params;
    await userService.deleteUser(id);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return toErrorResponse(error);
  }
}
