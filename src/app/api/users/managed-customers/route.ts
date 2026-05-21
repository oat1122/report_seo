import { NextResponse } from "next/server";
import { listManagedCustomers } from "@/features/users";
import { requireRole } from "@/infrastructure/auth/session";
import { toErrorResponse } from "@/lib/http";
import { Role } from "@/types/auth";

export async function GET() {
  try {
    const session = await requireRole([Role.SEO_DEV]);
    return NextResponse.json(await listManagedCustomers(session.user.id));
  } catch (error) {
    return toErrorResponse(error);
  }
}
