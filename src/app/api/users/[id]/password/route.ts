import { NextResponse } from "next/server";
import { userService } from "@/services/UserService";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Role } from "@/types/auth";

// PUT /api/users/[id]/password - อัปเดตรหัสผ่าน
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const { currentPassword, newPassword, confirmPassword } = await req.json();

    const isOwner = session.user.id === id;
    const isAdmin = session.user.role === Role.ADMIN;

    if (!isAdmin && !isOwner) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (newPassword !== confirmPassword) {
      return NextResponse.json(
        { error: "New passwords do not match" },
        { status: 400 }
      );
    }

    await userService.updatePassword(id, currentPassword, newPassword, isAdmin);

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Failed to update password:", error);

    const errorMessage = (error as Error).message;

    if (errorMessage === "User not found") {
      return NextResponse.json({ error: errorMessage }, { status: 404 });
    }
    if (errorMessage.includes("password")) {
      return NextResponse.json({ error: errorMessage }, { status: 400 });
    }

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
