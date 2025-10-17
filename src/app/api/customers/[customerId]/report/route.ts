import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/customers/[customerId]/report
export async function GET(
  req: Request,
  { params }: { params: { customerId: string } }
) {
  try {
    const { customerId } = params;

    // 1. ค้นหา Customer Profile โดยใช้ userId พร้อมกับข้อมูล User
    const customer = await prisma.customer.findUnique({
      where: { userId: customerId },
      include: {
        user: {
          select: { name: true },
        },
      },
    });

    if (!customer) {
      // ถ้าไม่พบลูกค้า ให้ส่งค่าว่างกลับไป
      return NextResponse.json({
        metrics: null,
        topKeywords: [],
        otherKeywords: [],
        recommendations: [], // เพิ่ม recommendations ในกรณีไม่พบลูกค้าด้วย
        customerName: null,
        domain: null,
      });
    }

    // 2. ดึงข้อมูล Metrics, Keywords และ Recommendations พร้อมกัน
    const [metrics, keywords, recommendations] = await Promise.all([
      prisma.overallMetrics.findUnique({
        where: { customerId: customer.id },
      }),
      prisma.keywordReport.findMany({
        where: { customerId: customer.id },
        orderBy: [{ isTopReport: "desc" }, { position: "asc" }], // จัดเรียงตาม isTopReport ก่อน แล้วตาม position
      }),
      // ดึงข้อมูล KeywordRecommend เพิ่ม
      prisma.keywordRecommend.findMany({
        where: { customerId: customer.id },
        orderBy: { createdAt: "desc" },
      }),
    ]);

    // 3. แยกประเภท Keywords
    const topKeywords = keywords.filter((kw) => kw.isTopReport);
    const otherKeywords = keywords.filter((kw) => !kw.isTopReport);

    return NextResponse.json({
      metrics,
      topKeywords,
      otherKeywords,
      recommendations, // ส่ง recommendations กลับไปด้วย
      customerName: customer.user.name,
      domain: customer.domain,
    });
  } catch (error) {
    console.error("Failed to fetch customer report data:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
