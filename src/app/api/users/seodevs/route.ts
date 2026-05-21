import { NextResponse } from "next/server";
import { listSeoDevs } from "@/features/users";
import { requireRole } from "@/infrastructure/auth/session";
import { toErrorResponse } from "@/lib/http";
import { Role } from "@/types/auth";

export async function GET() {
  try {
    await requireRole([Role.ADMIN]);
    return NextResponse.json(await listSeoDevs());
  } catch (error) {
    return toErrorResponse(error);
  }
}
