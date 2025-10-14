import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/customers/[customerId]/metrics - ดึงข้อมูล Metrics ของลูกค้า
export async function GET(
  req: Request,
  { params }: { params: Promise<{ customerId: string }> }
) {
  try {
    const { customerId } = await params;

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
    const { customerId } = await params;

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

    const data = await req.json();
    // แปลงค่าที่เป็น string ให้เป็นตัวเลข
    const numericData = {
      domainRating: parseInt(data.domainRating, 10),
      healthScore: parseInt(data.healthScore, 10),
      ageInYears: parseInt(data.ageInYears, 10),
      spamScore: parseInt(data.spamScore, 10),
      organicTraffic: parseFloat(data.organicTraffic),
      organicKeywords: parseFloat(data.organicKeywords),
      backlinks: parseInt(data.backlinks, 10),
      refDomains: parseInt(data.refDomains, 10),
    };

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
