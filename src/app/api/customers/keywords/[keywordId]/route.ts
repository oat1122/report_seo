import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// PUT /api/customers/keywords/[keywordId] - อัปเดต Keyword
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ keywordId: string }> }
) {
  try {
    const { keywordId } = await params;
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
    const { keywordId } = await params;
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
