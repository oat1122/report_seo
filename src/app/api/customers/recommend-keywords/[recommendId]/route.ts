import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// DELETE /api/customers/recommend-keywords/[recommendId]
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ recommendId: string }> }
) {
  try {
    const { recommendId } = await params;
    await prisma.keywordRecommend.delete({
      where: { id: recommendId },
    });
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Error deleting recommend keyword:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
