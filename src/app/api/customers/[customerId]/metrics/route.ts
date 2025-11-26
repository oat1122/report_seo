import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { getSession } from "@/lib/auth-utils";
import { Role } from "@/types/auth";

// --- Zod Schema สำหรับ Validation ---
const metricsSchema = z.object({
  domainRating: z.coerce.number().int().min(0).max(100),
  healthScore: z.coerce.number().int().min(0).max(100),
  ageInYears: z.coerce.number().int().min(0),
  ageInMonths: z.coerce.number().int().min(0).max(11).default(0),
  spamScore: z.coerce.number().int().min(0).max(100),
  organicTraffic: z.coerce.number().int().min(0),
  organicKeywords: z.coerce.number().int().min(0),
  backlinks: z.coerce.number().int().min(0),
  refDomains: z.coerce.number().int().min(0),
});

// GET /api/customers/[customerId]/metrics - ดึงข้อมูล Metrics ของลูกค้า
export async function GET(
  req: Request,
  { params }: { params: Promise<{ customerId: string }> }
) {
  try {
    // 🔒 Authorization: ตรวจสอบ session
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { customerId } = await params;

    // 🔒 Authorization: ตรวจสอบสิทธิ์ (ต้องเป็น Admin, SEO_DEV หรือเจ้าของข้อมูล)
    const isOwner = session.user.id === customerId;
    const isAdmin = session.user.role === Role.ADMIN;
    const isSeoDev = session.user.role === Role.SEO_DEV;

    if (!isOwner && !isAdmin && !isSeoDev) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // หา Customer profile จาก User ID
    const customer = await prisma.customer.findUnique({
      where: { userId: customerId },
    });

    if (!customer) {
      return NextResponse.json(null);
    }

    const metrics = await prisma.overallMetrics.findUnique({
      where: { customerId: customer.id },
    });
    return NextResponse.json(metrics);
  } catch (error) {
    console.error("Error fetching metrics:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// POST /api/customers/[customerId]/metrics - สร้างหรืออัปเดต Metrics
export async function POST(
  req: Request,
  { params }: { params: Promise<{ customerId: string }> }
) {
  try {
    // 🔒 Authorization: ตรวจสอบ session
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { customerId } = await params;

    // 🔒 Authorization: ตรวจสอบสิทธิ์ (ต้องเป็น Admin, SEO_DEV หรือเจ้าของข้อมูล)
    const isOwner = session.user.id === customerId;
    const isAdmin = session.user.role === Role.ADMIN;
    const isSeoDev = session.user.role === Role.SEO_DEV;

    if (!isOwner && !isAdmin && !isSeoDev) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // หา Customer profile จาก User ID
    const customer = await prisma.customer.findUnique({
      where: { userId: customerId },
    });

    if (!customer) {
      return NextResponse.json(
        { error: "Customer not found" },
        { status: 404 }
      );
    }

    const json = await req.json();

    // --- Validate ข้อมูลด้วย Zod ---
    const validationResult = metricsSchema.safeParse(json);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Invalid data",
          issues: validationResult.error.issues,
        },
        { status: 400 }
      );
    }

    // ข้อมูลที่ผ่านการ validate และแปลง type แล้ว
    const numericData = validationResult.data;

    const metrics = await prisma.overallMetrics.upsert({
      where: { customerId: customer.id },
      update: numericData,
      create: {
        ...numericData,
        customerId: customer.id,
      },
    });
    return NextResponse.json(metrics, { status: 201 });
  } catch (error) {
    console.error("Error saving metrics:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
