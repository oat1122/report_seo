import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth-utils";
import { Role } from "@/types/auth";

// GET /api/customers/[customerId]/keywords - ดึง Keywords ของลูกค้า
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

    // 🔒 Authorization: ตรวจสอบสิทธิ์
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
    // 🔒 Authorization: ตรวจสอบ session
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { customerId } = await params;

    // 🔒 Authorization: ตรวจสอบสิทธิ์
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
