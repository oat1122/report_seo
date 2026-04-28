import { NextResponse } from "next/server";
import { requireAdminOnly, requireSession } from "@/lib/api-auth";
import { toErrorResponse } from "@/lib/http";
import { userService } from "@/services/UserService";

async function restoreHandler(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const auth = await requireSession();
    if (auth.response || !auth.session) {
      return auth.response;
    }

    const roleError = requireAdminOnly(auth.session);
    if (roleError) {
      return roleError;
    }

    const { id } = await params;
    await userService.restoreUser(id);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return toErrorResponse(error);
  }
}

export const PUT = restoreHandler;
export const PATCH = restoreHandler;
