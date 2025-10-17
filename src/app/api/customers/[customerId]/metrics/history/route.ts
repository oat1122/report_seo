import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ customerId: string }> }
) {
  try {
    const { customerId } = await params;

    // ค้นหา Customer จาก userId
    const customer = await prisma.customer.findUnique({
      where: { userId: customerId },
    });

    if (!customer) {
      return NextResponse.json(
        { error: "Customer not found" },
        { status: 404 }
      );
    }

    // ดึงข้อมูลประวัติ Overall Metrics เรียงจากใหม่ไปเก่า
    const metricsHistory = await prisma.overallMetricsHistory.findMany({
      where: { customerId: customer.id },
      orderBy: {
        dateRecorded: "desc",
      },
    });

    // ดึงข้อมูล Keywords ปัจจุบันของ Customer
    const keywords = await prisma.keywordReport.findMany({
      where: { customerId: customer.id },
      select: { id: true },
    });

    const keywordIds = keywords.map((kw) => kw.id);

    // ดึงประวัติของ Keywords ทั้งหมด
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
    });
  } catch (error) {
    console.error("Failed to fetch metrics history:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
