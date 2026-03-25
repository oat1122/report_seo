import { NextResponse } from "next/server";
import {
  enforceCustomerReadAccess,
  getKeywordAccessContext,
} from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ keywordId: string }> }
) {
  try {
    const { keywordId } = await params;
    const access = await getKeywordAccessContext(keywordId);

    if (access.response || !access.context) {
      return access.response;
    }

    const permissionError = enforceCustomerReadAccess(access.context);
    if (permissionError) {
      return permissionError;
    }

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
