// src/app/api/customers/keywords/[keywordId]/history/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ keywordId: string }> }
) {
  try {
    const { keywordId } = await params;
    const history = await prisma.keywordReportHistory.findMany({
      where: { reportId: keywordId },
      orderBy: {
        dateRecorded: "desc",
      },
    });
    return NextResponse.json(history);
  } catch (error) {
    console.error("Failed to fetch keyword history:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
