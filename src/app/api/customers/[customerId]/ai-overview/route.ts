import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth-utils";
import { validateUploadFile } from "@/lib/file-upload";
import { prisma } from "@/lib/prisma";
import { Role } from "@/types/auth";
import { writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import path from "path";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "ai-overview");

// GET /api/customers/[customerId]/ai-overview
export async function GET(
  req: Request,
  { params }: { params: Promise<{ customerId: string }> },
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { customerId } = await params;

    // ค้นหา Customer โดยใช้ userId
    const customer = await prisma.customer.findUnique({
      where: { userId: customerId },
    });

    if (!customer) {
      return NextResponse.json([]);
    }

    const aiOverviews = await prisma.aiOverview.findMany({
      where: { customerId: customer.id },
      include: { images: true },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(aiOverviews);
  } catch (error) {
    console.error("Failed to fetch AI Overview:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

// POST /api/customers/[customerId]/ai-overview
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ customerId: string }> },
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // เฉพาะ ADMIN และ SEO_DEV เท่านั้นที่สร้างได้
    const userRole = session.user.role;
    if (userRole !== Role.ADMIN && userRole !== Role.SEO_DEV) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { customerId } = await params;

    // ค้นหา Customer โดยใช้ userId
    const customer = await prisma.customer.findUnique({
      where: { userId: customerId },
    });

    if (!customer) {
      return NextResponse.json({ error: "ไม่พบข้อมูลลูกค้า" }, { status: 404 });
    }

    // รับ FormData
    const formData = await req.formData();
    const title = formData.get("title") as string | null;
    const displayDateStr = formData.get("displayDate") as string | null;
    const files = formData.getAll("files") as File[];

    if (!title || !title.trim()) {
      return NextResponse.json(
        { error: "กรุณาระบุหัวข้อ AI Overview" },
        { status: 400 },
      );
    }

    if (files.length === 0) {
      return NextResponse.json(
        { error: "กรุณาอัปโหลดรูปภาพอย่างน้อย 1 รูป" },
        { status: 400 },
      );
    }

    if (files.length > 3) {
      return NextResponse.json(
        { error: "อัปโหลดรูปภาพได้สูงสุด 3 รูป" },
        { status: 400 },
      );
    }

    // สร้างโฟลเดอร์ถ้ายังไม่มี
    if (!existsSync(UPLOAD_DIR)) {
      await mkdir(UPLOAD_DIR, { recursive: true });
    }

    // Validate และบันทึกไฟล์ทั้งหมด
    const imageUrls: string[] = [];
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

    // Parse displayDate
    const displayDate = displayDateStr ? new Date(displayDateStr) : new Date();

    // สร้าง AiOverview + AiOverviewImage ใน DB
    const aiOverview = await prisma.aiOverview.create({
      data: {
        title: title.trim(),
        displayDate: displayDate,
        customerId: customer.id,
        images: {
          create: imageUrls.map((url) => ({ imageUrl: url })),
        },
      },
      include: { images: true },
    });

    return NextResponse.json(aiOverview, { status: 201 });
  } catch (error) {
    console.error("Failed to create AI Overview:", error);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในการสร้าง AI Overview" },
      { status: 500 },
    );
  }
}
