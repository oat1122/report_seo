import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth-utils";
import { prisma } from "@/lib/prisma";
import { Role } from "@/types/auth";
import { unlink } from "fs/promises";
import { existsSync } from "fs";
import path from "path";

// DELETE /api/customers/[customerId]/ai-overview/[id]
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ customerId: string; id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // เฉพาะ ADMIN และ SEO_DEV เท่านั้นที่ลบได้
    const userRole = session.user.role;
    if (userRole !== Role.ADMIN && userRole !== Role.SEO_DEV) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;

    // ดึง AI Overview พร้อมรูปภาพก่อนลบ
    const aiOverview = await prisma.aiOverview.findUnique({
      where: { id },
      include: { images: true },
    });

    if (!aiOverview) {
      return NextResponse.json(
        { error: "ไม่พบข้อมูล AI Overview" },
        { status: 404 }
      );
    }

    // ลบไฟล์รูปภาพจาก disk
    for (const image of aiOverview.images) {
      const filePath = path.join(process.cwd(), "public", image.imageUrl);
      if (existsSync(filePath)) {
        try {
          await unlink(filePath);
        } catch (err) {
          console.error(`Failed to delete file: ${filePath}`, err);
        }
      }
    }

    // ลบ AI Overview จาก DB (cascade จะลบ images ด้วย)
    await prisma.aiOverview.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "ลบ AI Overview สำเร็จ" });
  } catch (error) {
    console.error("Failed to delete AI Overview:", error);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในการลบ AI Overview" },
      { status: 500 }
    );
  }
}
