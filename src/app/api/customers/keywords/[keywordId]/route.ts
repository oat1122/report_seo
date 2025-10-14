import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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
