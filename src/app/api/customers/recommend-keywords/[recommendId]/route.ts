import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth-utils";
import { Role } from "@/types/auth";

// DELETE /api/customers/recommend-keywords/[recommendId]
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ recommendId: string }> }
) {
  try {
    // 🔒 Authorization: ตรวจสอบ session
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { recommendId } = await params;

    // 🔒 Authorization: ดึงข้อมูล recommend keyword เพื่อตรวจสอบเจ้าของ
    const existingRecommend = await prisma.keywordRecommend.findUnique({
      where: { id: recommendId },
      include: {
        customer: {
          select: { userId: true },
        },
      },
    });

    if (!existingRecommend) {
      return NextResponse.json(
        { error: "Recommend keyword not found" },
        { status: 404 }
      );
    }

    // 🔒 Authorization: ตรวจสอบสิทธิ์
    const isOwner = session.user.id === existingRecommend.customer.userId;
    const isAdmin = session.user.role === Role.ADMIN;
    const isSeoDev = session.user.role === Role.SEO_DEV;

    if (!isOwner && !isAdmin && !isSeoDev) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await prisma.keywordRecommend.delete({
      where: { id: recommendId },
    });
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Error deleting recommend keyword:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
