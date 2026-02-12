import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth-utils";
import { validateUploadFile } from "@/lib/file-upload";
import { prisma } from "@/lib/prisma";
import { Role } from "@/types/auth";
import { unlink, writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import path from "path";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "ai-overview");

// PUT /api/customers/[customerId]/ai-overview/[id]
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ customerId: string; id: string }> },
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // เฉพาะ ADMIN และ SEO_DEV เท่านั้นที่แก้ไขได้
    const userRole = session.user.role;
    if (userRole !== Role.ADMIN && userRole !== Role.SEO_DEV) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { customerId, id } = await params;

    // ค้นหา Customer
    const customer = await prisma.customer.findUnique({
      where: { userId: customerId },
    });

    if (!customer) {
      return NextResponse.json({ error: "ไม่พบข้อมูลลูกค้า" }, { status: 404 });
    }

    // ตรวจสอบว่า AI Overview มีอยู่และเป็นของ customer นี้
    const aiOverview = await prisma.aiOverview.findFirst({
      where: {
        id,
        customerId: customer.id,
      },
      include: { images: true },
    });

    if (!aiOverview) {
      return NextResponse.json(
        { error: "ไม่พบข้อมูล AI Overview" },
        { status: 404 },
      );
    }

    // รับ FormData
    const formData = await req.formData();
    const title = formData.get("title") as string | null;
    const displayDateStr = formData.get("displayDate") as string | null;
    const imagesToDeleteStr = formData.get("imagesToDelete") as string | null;
    const files = formData.getAll("files") as File[];

    // Validate title
    if (!title || !title.trim()) {
      return NextResponse.json(
        { error: "กรุณาระบุหัวข้อ AI Overview" },
        { status: 400 },
      );
    }

    // Parse imagesToDelete
    const imagesToDelete: string[] = imagesToDeleteStr
      ? JSON.parse(imagesToDeleteStr)
      : [];

    // คำนวณจำนวนรูปภาพหลังจากลบและเพิ่มใหม่
    const remainingImages = aiOverview.images.filter(
      (img) => !imagesToDelete.includes(img.id),
    ).length;
    const totalImages = remainingImages + files.length;

    if (totalImages === 0) {
      return NextResponse.json(
        { error: "ต้องมีรูปภาพอย่างน้อย 1 รูป" },
        { status: 400 },
      );
    }

    if (totalImages > 3) {
      return NextResponse.json(
        { error: "อัปโหลดรูปภาพได้สูงสุด 3 รูป" },
        { status: 400 },
      );
    }

    // ลบรูปภาพที่ระบุ
    for (const imageId of imagesToDelete) {
      const image = aiOverview.images.find((img) => img.id === imageId);
      if (image) {
        // ลบไฟล์จาก disk
        const filePath = path.join(process.cwd(), "public", image.imageUrl);
        if (existsSync(filePath)) {
          try {
            await unlink(filePath);
          } catch (err) {
            console.error(`Failed to delete file: ${filePath}`, err);
          }
        }
        // ลบจาก DB
        await prisma.aiOverviewImage.delete({ where: { id: imageId } });
      }
    }

    // อัปโหลดรูปภาพใหม่
    const imageUrls: string[] = [];
    if (files.length > 0) {
      // สร้างโฟลเดอร์ถ้ายังไม่มี
      if (!existsSync(UPLOAD_DIR)) {
        await mkdir(UPLOAD_DIR, { recursive: true });
      }

      for (const file of files) {
        const validationResult = await validateUploadFile(file);
        if (!validationResult.isValid || !validationResult.validatedFile) {
          return NextResponse.json(
            { error: validationResult.error || "ไฟล์ไม่ผ่านการตรวจสอบ" },
            { status: 400 },
          );
        }

        const { validatedFile } = validationResult;
        const filePath = path.join(UPLOAD_DIR, validatedFile.filename);
        await writeFile(filePath, validatedFile.buffer);
        imageUrls.push(`/uploads/ai-overview/${validatedFile.filename}`);
      }
    }

    // Parse displayDate
    const displayDate = displayDateStr
      ? new Date(displayDateStr)
      : aiOverview.displayDate;

    // อัพเดท AI Overview
    const updatedAiOverview = await prisma.aiOverview.update({
      where: { id },
      data: {
        title: title.trim(),
        displayDate: displayDate,
        ...(imageUrls.length > 0 && {
          images: {
            create: imageUrls.map((url) => ({ imageUrl: url })),
          },
        }),
      },
      include: { images: true },
    });

    return NextResponse.json(updatedAiOverview);
  } catch (error) {
    console.error("Failed to update AI Overview:", error);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในการอัพเดท AI Overview" },
      { status: 500 },
    );
  }
}

// DELETE /api/customers/[customerId]/ai-overview/[id]
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ customerId: string; id: string }> },
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
        { status: 404 },
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

    return NextResponse.json({
      success: true,
      message: "ลบ AI Overview สำเร็จ",
    });
  } catch (error) {
    console.error("Failed to delete AI Overview:", error);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในการลบ AI Overview" },
      { status: 500 },
    );
  }
}
