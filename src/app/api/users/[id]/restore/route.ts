import { NextResponse } from "next/server";
import { requireAdminOnly, requireSession } from "@/lib/api-auth";
import { userService } from "@/services/UserService";

async function restoreHandler(
  req: Request,
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
    console.error("Failed to restore user:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  return restoreHandler(req, { params });
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  return restoreHandler(req, { params });
}
