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

    // ดึงข้อมูลประวัติทั้งหมดเรียงจากใหม่ไปเก่า
    const history = await prisma.overallMetricsHistory.findMany({
      where: { customerId: customer.id },
      orderBy: {
        dateRecorded: "desc",
      },
    });

    return NextResponse.json(history);
  } catch (error) {
    console.error("Failed to fetch metrics history:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
