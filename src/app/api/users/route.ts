import { NextRequest, NextResponse } from "next/server";
import { requireAdminOnly, requireSession } from "@/lib/api-auth";
import { toErrorResponse } from "@/lib/http";
import { userService } from "@/services/UserService";
import { userCreateSchema } from "@/schemas/user";

export async function GET(request: NextRequest) {
  try {
    const auth = await requireSession();
    if (auth.response || !auth.session) {
      return auth.response;
    }

    const roleError = requireAdminOnly(auth.session);
    if (roleError) {
      return roleError;
    }

    const { searchParams } = new URL(request.url);
    const includeDeleted = searchParams.get("includeDeleted") === "true";

    const users = await userService.getUsers(includeDeleted);

    return NextResponse.json(users);
  } catch (error) {
    return toErrorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    const auth = await requireSession();
    if (auth.response || !auth.session) {
      return auth.response;
    }

    const roleError = requireAdminOnly(auth.session);
    if (roleError) {
      return roleError;
    }

    const body = await request.json();
    const input = userCreateSchema.parse(body);
    const newUser = await userService.createUser(input);

    return NextResponse.json(newUser, { status: 201 });
  } catch (error) {
    return toErrorResponse(error);
  }
}
