import { NextResponse } from "next/server";
import {
  enforceCustomerReadAccess,
  getCustomerAccessByUserId,
} from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ customerId: string }> },
) {
  try {
    const { customerId } = await params;
    const access = await getCustomerAccessByUserId(customerId);

    if (access.response || !access.context) {
      return access.response;
    }

    const permissionError = enforceCustomerReadAccess(access.context);
    if (permissionError) {
      return permissionError;
    }

    const metricsHistory = await prisma.overallMetricsHistory.findMany({
      where: { customerId: access.context.customer.id },
      orderBy: {
        dateRecorded: "desc",
      },
    });

    const currentKeywords = await prisma.keywordReport.findMany({
      where: { customerId: access.context.customer.id },
      orderBy: { traffic: "desc" },
    });

    const keywordIds = currentKeywords.map((kw) => kw.id);

    const keywordHistory = await prisma.keywordReportHistory.findMany({
      where: {
        reportId: {
          in: keywordIds,
        },
      },
      orderBy: {
        dateRecorded: "desc",
      },
    });

    return NextResponse.json({
      metricsHistory,
      keywordHistory,
      currentKeywords,
    });
  } catch (error) {
    console.error("Failed to fetch metrics history:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
