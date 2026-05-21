import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/infrastructure/auth/session";
import { toErrorResponse } from "@/lib/http";
import { createUser, listUsers, userCreateSchema } from "@/features/users";
import { Role } from "@/types/auth";

export async function GET(request: NextRequest) {
  try {
    await requireRole([Role.ADMIN]);
    const { searchParams } = new URL(request.url);
    const includeDeleted = searchParams.get("includeDeleted") === "true";
    return NextResponse.json(await listUsers(includeDeleted));
  } catch (error) {
    return toErrorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    await requireRole([Role.ADMIN]);
    const input = userCreateSchema.parse(await request.json());
    return NextResponse.json(await createUser(input), { status: 201 });
  } catch (error) {
    return toErrorResponse(error);
  }
}
