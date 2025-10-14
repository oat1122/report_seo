import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Role } from "@/types/auth";

// GET /api/users/seodevs - ดึงผู้ใช้ที่เป็น SEO_DEV ทั้งหมด
export async function GET() {
  try {
    const seoDevs = await prisma.user.findMany({
      where: {
        role: Role.SEO_DEV,
      },
      orderBy: {
        name: "asc",
      },
    });
    return NextResponse.json(seoDevs);
  } catch (error) {
    console.error("Failed to fetch SEO Devs:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
