import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/users/[id] - ดึงผู้ใช้รายบุคคล
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: params.id },
    });
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
  { params }: { params: { id: string } }
) {
  try {
    const { name, email, role } = await request.json();
    const updatedUser = await prisma.user.update({
      where: { id: params.id },
      data: { name, email, role },
    });
    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("Failed to update user:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// DELETE /api/users/[id] - ลบผู้ใช้ (จะถูกเปลี่ยนเป็น Soft Delete โดย Middleware)
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.user.delete({
      where: { id: params.id },
    });
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Failed to delete user:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
