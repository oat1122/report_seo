import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { KDLevel } from "@prisma/client";

// GET /api/customers/[customerId]/recommend-keywords
export async function GET(
  req: Request,
  { params }: { params: Promise<{ customerId: string }> }
) {
  try {
    const { customerId } = await params;

    // ดึง Customer จาก userId
    const customer = await prisma.customer.findUnique({
      where: { userId: customerId },
    });

    if (!customer) {
      return NextResponse.json(
        { error: "Customer not found" },
        { status: 404 }
      );
    }

    const keywords = await prisma.keywordRecommend.findMany({
      where: { customerId: customer.id },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(keywords);
  } catch (error) {
    console.error("Error fetching recommend keywords:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// POST /api/customers/[customerId]/recommend-keywords
export async function POST(
  req: Request,
  { params }: { params: Promise<{ customerId: string }> }
) {
  try {
    const { customerId } = await params;
    const { keyword, kd, isTopReport, note } = await req.json();

    if (!keyword) {
      return NextResponse.json(
        { error: "Keyword is required" },
        { status: 400 }
      );
    }

    // ดึง Customer จาก userId
    const customer = await prisma.customer.findUnique({
      where: { userId: customerId },
    });

    if (!customer) {
      return NextResponse.json(
        { error: "Customer not found" },
        { status: 404 }
      );
    }

    const newKeyword = await prisma.keywordRecommend.create({
      data: {
        keyword,
        note,
        kd: kd as KDLevel | null,
        isTopReport: isTopReport || false,
        customerId: customer.id,
      },
    });
    return NextResponse.json(newKeyword, { status: 201 });
  } catch (error) {
    console.error("Error creating recommend keyword:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
