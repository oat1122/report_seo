import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";
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

    // Admin can change anyone's password without the current password
    // SEO Dev can only change their own password and must provide the current one
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

    const userToUpdate = await prisma.user.findUnique({ where: { id } });

    if (!userToUpdate) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // If not admin, verify current password
    if (!isAdmin) {
      if (!currentPassword || !userToUpdate.password) {
        return NextResponse.json(
          { error: "Current password is required" },
          { status: 400 }
        );
      }
      const isPasswordValid = await bcrypt.compare(
        currentPassword,
        userToUpdate.password
      );
      if (!isPasswordValid) {
        return NextResponse.json(
          { error: "Invalid current password" },
          { status: 400 }
        );
      }
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id },
      data: {
        password: hashedNewPassword,
      },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Failed to update password:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
