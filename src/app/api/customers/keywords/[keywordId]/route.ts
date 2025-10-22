import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth-utils";
import { Role } from "@/types/auth";

// PUT /api/customers/keywords/[keywordId] - อัปเดต Keyword
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ keywordId: string }> }
) {
  try {
    // 🔒 Authorization: ตรวจสอบ session
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { keywordId } = await params;

    // 🔒 Authorization: ดึงข้อมูล keyword เพื่อตรวจสอบเจ้าของ
    const existingKeyword = await prisma.keywordReport.findUnique({
      where: { id: keywordId },
      include: {
        customer: {
          select: { userId: true },
        },
      },
    });

    if (!existingKeyword) {
      return NextResponse.json({ error: "Keyword not found" }, { status: 404 });
    }

    // 🔒 Authorization: ตรวจสอบสิทธิ์
    const isOwner = session.user.id === existingKeyword.customer.userId;
    const isAdmin = session.user.role === Role.ADMIN;
    const isSeoDev = session.user.role === Role.SEO_DEV;

    if (!isOwner && !isAdmin && !isSeoDev) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const data = await req.json();

    // อัปเดตข้อมูล Keyword
    const updatedKeyword = await prisma.keywordReport.update({
      where: { id: keywordId },
      data: {
        keyword: data.keyword,
        position: data.position ? parseInt(data.position, 10) : null,
        traffic: parseInt(data.traffic, 10),
        kd: data.kd,
        isTopReport: data.isTopReport,
      },
    });

    return NextResponse.json(updatedKeyword);
  } catch (error) {
    console.error("Error updating keyword:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// DELETE /api/customers/keywords/[keywordId] - ลบ Keyword
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ keywordId: string }> }
) {
  try {
    // 🔒 Authorization: ตรวจสอบ session
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { keywordId } = await params;

    // 🔒 Authorization: ดึงข้อมูล keyword เพื่อตรวจสอบเจ้าของ
    const existingKeyword = await prisma.keywordReport.findUnique({
      where: { id: keywordId },
      include: {
        customer: {
          select: { userId: true },
        },
      },
    });

    if (!existingKeyword) {
      return NextResponse.json({ error: "Keyword not found" }, { status: 404 });
    }

    // 🔒 Authorization: ตรวจสอบสิทธิ์
    const isOwner = session.user.id === existingKeyword.customer.userId;
    const isAdmin = session.user.role === Role.ADMIN;
    const isSeoDev = session.user.role === Role.SEO_DEV;

    if (!isOwner && !isAdmin && !isSeoDev) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await prisma.keywordReport.delete({
      where: { id: keywordId },
    });
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Error deleting keyword:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
