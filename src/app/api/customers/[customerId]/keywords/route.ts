import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/customers/[customerId]/keywords - ดึง Keywords ของลูกค้า
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
      return NextResponse.json([]);
    }

    const keywords = await prisma.keywordReport.findMany({
      where: { customerId: customer.id },
      orderBy: { dateRecorded: "desc" },
    });
    return NextResponse.json(keywords);
  } catch (error) {
    console.error("Error fetching keywords:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// POST /api/customers/[customerId]/keywords - เพิ่ม Keyword ใหม่
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

    const { keyword, position, traffic, kd, isTopReport } = await req.json();
    const newKeyword = await prisma.keywordReport.create({
      data: {
        keyword,
        position: position ? parseInt(position, 10) : null,
        traffic: parseInt(traffic, 10),
        kd,
        isTopReport,
        customerId: customer.id,
      },
    });
    return NextResponse.json(newKeyword, { status: 201 });
  } catch (error) {
    console.error("Error adding keyword:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
