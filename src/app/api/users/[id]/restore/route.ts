import { NextResponse } from "next/server";
import { restoreUser } from "@/features/users";
import { requireRole } from "@/infrastructure/auth/session";
import { toErrorResponse } from "@/lib/http";
import { Role } from "@/types/auth";

async function handler(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireRole([Role.ADMIN]);
    const { id } = await params;
    await restoreUser(id);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return toErrorResponse(error);
  }
}

export const PUT = handler;
export const PATCH = handler;
