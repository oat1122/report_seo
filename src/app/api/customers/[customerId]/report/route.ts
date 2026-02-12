import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth-utils";
import { Role } from "@/types/auth";

// GET /api/customers/[customerId]/report
export async function GET(
  req: Request,
  { params }: { params: Promise<{ customerId: string }> }
) {
  try {
    // 🔒 Authorization: ตรวจสอบ session
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { customerId } = await params;

    // 🔒 Authorization: ตรวจสอบสิทธิ์
    const isOwner = session.user.id === customerId;
    const isAdmin = session.user.role === Role.ADMIN;
    const isSeoDev = session.user.role === Role.SEO_DEV;

    if (!isOwner && !isAdmin && !isSeoDev) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

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
        recommendations: [],
        aiOverviews: [],
        customerName: null,
        domain: null,
      });
    }

    // 2. ดึงข้อมูล Metrics, Keywords และ Recommendations พร้อมกัน
    const [metrics, keywords, recommendations, aiOverviews] = await Promise.all([
      prisma.overallMetrics.findUnique({
        where: { customerId: customer.id },
      }),
      prisma.keywordReport.findMany({
        where: { customerId: customer.id },
        orderBy: [{ isTopReport: "desc" }, { position: "asc" }],
      }),
      prisma.keywordRecommend.findMany({
        where: { customerId: customer.id },
        orderBy: { createdAt: "desc" },
      }),
      prisma.aiOverview.findMany({
        where: { customerId: customer.id },
        include: { images: true },
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
      recommendations,
      aiOverviews,
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
