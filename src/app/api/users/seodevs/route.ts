import { NextResponse } from "next/server";
import { requireAdminOnly, requireSession } from "@/lib/api-auth";
import { userService } from "@/services/UserService";

// GET /api/users/seodevs - ดึงผู้ใช้ที่เป็น SEO_DEV ทั้งหมด
export async function GET() {
  try {
    const auth = await requireSession();
    if (auth.response || !auth.session) {
      return auth.response;
    }

    const roleError = requireAdminOnly(auth.session);
    if (roleError) {
      return roleError;
    }

    const seoDevs = await userService.getSeoDevs();
    return NextResponse.json(seoDevs);
  } catch (error) {
    console.error("Failed to fetch SEO Devs:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
