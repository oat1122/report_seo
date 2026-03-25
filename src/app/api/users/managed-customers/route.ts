import { NextResponse } from "next/server";
import { requireRole, requireSession } from "@/lib/api-auth";
import { userService } from "@/services/UserService";
import { Role } from "@/types/auth";

export async function GET() {
  try {
    const auth = await requireSession();
    if (auth.response || !auth.session) {
      return auth.response;
    }

    const roleError = requireRole(auth.session, [Role.SEO_DEV]);
    if (roleError) {
      return roleError;
    }

    const customers = await userService.getManagedCustomers(auth.session.user.id);
    return NextResponse.json(customers);
  } catch (error) {
    console.error("Failed to fetch managed customers:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
