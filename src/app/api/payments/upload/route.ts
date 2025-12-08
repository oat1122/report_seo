/**
 * Payment Proof Upload API
 * POST /api/payments/upload
 *
 * อัปโหลดสลิปโอนเงินพร้อมการตรวจสอบความปลอดภัย
 * - ตรวจสอบ session (ต้อง login)
 * - รับเฉพาะไฟล์ .jpg, .jpeg, .png
 * - ตรวจสอบ MIME type และ magic bytes
 * - จำกัดขนาดไม่เกิน 5MB
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { validateUploadFile } from "@/lib/file-upload";
import { writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import prisma from "@/lib/prisma";

// โฟลเดอร์สำหรับเก็บไฟล์
const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "payments");

export async function POST(request: NextRequest) {
  try {
    // 1. ตรวจสอบ session
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: "กรุณาเข้าสู่ระบบก่อนอัปโหลดไฟล์" },
        { status: 401 }
      );
    }

    // 2. รับ FormData
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const customerId = formData.get("customerId") as string | null;

    if (!file) {
      return NextResponse.json(
        { error: "กรุณาเลือกไฟล์ที่ต้องการอัปโหลด" },
        { status: 400 }
      );
    }

    if (!customerId) {
      return NextResponse.json(
        { error: "กรุณาระบุ customerId" },
        { status: 400 }
      );
    }

    // 3. ตรวจสอบว่า customer มีอยู่จริง
    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
    });

    if (!customer) {
      return NextResponse.json({ error: "ไม่พบข้อมูลลูกค้า" }, { status: 404 });
    }

    // 4. Validate file (extension, MIME type, size, magic bytes)
    const validationResult = await validateUploadFile(file);

    if (!validationResult.isValid || !validationResult.validatedFile) {
      return NextResponse.json(
        { error: validationResult.error || "ไฟล์ไม่ผ่านการตรวจสอบ" },
        { status: 400 }
      );
    }

    const { validatedFile } = validationResult;

    // 5. สร้างโฟลเดอร์ถ้ายังไม่มี
    if (!existsSync(UPLOAD_DIR)) {
      await mkdir(UPLOAD_DIR, { recursive: true });
    }

    // 6. บันทึกไฟล์
    const filePath = path.join(UPLOAD_DIR, validatedFile.filename);
    await writeFile(filePath, validatedFile.buffer);

    // 7. สร้าง URL สำหรับเข้าถึงไฟล์
    const uploadUrl = `/uploads/payments/${validatedFile.filename}`;

    // 8. สร้าง PaymentProof record ในฐานข้อมูล
    const paymentProof = await prisma.paymentProof.create({
      data: {
        uploadUrl,
        customerId,
        status: "PENDING",
      },
    });

    // 9. ส่ง response กลับ
    return NextResponse.json({
      success: true,
      message: "อัปโหลดสลิปสำเร็จ",
      data: {
        id: paymentProof.id,
        uploadUrl,
        status: paymentProof.status,
        uploadDate: paymentProof.uploadDate,
      },
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในการอัปโหลดไฟล์" },
      { status: 500 }
    );
  }
}

// GET - ดึงรายการ PaymentProof ทั้งหมด (สำหรับ Admin/SEO_DEV)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "กรุณาเข้าสู่ระบบ" }, { status: 401 });
    }

    // ตรวจสอบสิทธิ์ - เฉพาะ ADMIN และ SEO_DEV
    const user = session.user as { role?: string };
    if (user.role !== "ADMIN" && user.role !== "SEO_DEV") {
      return NextResponse.json(
        { error: "ไม่มีสิทธิ์เข้าถึง" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const customerId = searchParams.get("customerId");

    // สร้าง filter
    const where: Record<string, unknown> = {};
    if (status) where.status = status;
    if (customerId) where.customerId = customerId;

    const paymentProofs = await prisma.paymentProof.findMany({
      where,
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            domain: true,
          },
        },
      },
      orderBy: {
        uploadDate: "desc",
      },
    });

    return NextResponse.json({
      success: true,
      data: paymentProofs,
    });
  } catch (error) {
    console.error("Get payments error:", error);
    return NextResponse.json({ error: "เกิดข้อผิดพลาด" }, { status: 500 });
  }
}
