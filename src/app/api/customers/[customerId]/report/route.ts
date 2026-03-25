import { NextResponse } from "next/server";
import {
  enforceCustomerReadAccess,
  getCustomerAccessByUserId,
} from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ customerId: string }> }
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

    const customer = await prisma.customer.findUnique({
      where: { id: access.context.customer.id },
      include: {
        user: {
          select: { name: true },
        },
      },
    });

    if (!customer) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 });
    }

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
