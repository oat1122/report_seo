import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// PUT /api/users/[id]/restore
// อัปเดต field `deletedAt` ให้เป็น null
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // ใช้ updateMany เพื่อหลีกเลี่ยง middleware ของ findUnique
    // และอัปเดตเฉพาะ user ที่ถูก soft-delete ไปแล้ว
    await (prisma as any).user.updateMany({
      where: {
        id: id,
        deletedAt: {
          not: null,
        },
      },
      data: {
        deletedAt: null,
      },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Failed to restore user:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
