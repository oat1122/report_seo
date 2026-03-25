import { NextResponse } from "next/server";
import { requireAdminOnly, requireSession } from "@/lib/api-auth";
import { Role } from "@/types/auth";
import { userService } from "@/services/UserService";

const sanitizeSelfUpdate = (body: Record<string, unknown>) => ({
  name: typeof body.name === "string" ? body.name : undefined,
  email: typeof body.email === "string" ? body.email : undefined,
});

// GET /api/users/[id] - ดึงผู้ใช้รายบุคคล
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
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
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    return NextResponse.json(user);
  } catch (error) {
    console.error("Failed to fetch user:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// PUT /api/users/[id] - อัปเดตผู้ใช้
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
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
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const updatedUser = await userService.updateUser(
      id,
      isAdmin ? body : sanitizeSelfUpdate(body),
    );
    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("Failed to update user:", error);

    const errorMessage = (error as Error).message;

    if (errorMessage === "User not found") {
      return NextResponse.json({ error: errorMessage }, { status: 404 });
    }
    if (errorMessage.includes("Domain")) {
      return NextResponse.json({ error: errorMessage }, { status: 409 });
    }

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// DELETE /api/users/[id] - ลบผู้ใช้ (จะถูกเปลี่ยนเป็น Soft Delete โดย Middleware)
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
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
    console.error("Failed to delete user:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
