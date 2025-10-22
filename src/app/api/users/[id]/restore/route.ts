import { NextResponse } from "next/server";
import { userService } from "@/services/UserService";

// PUT /api/users/[id]/restore - Restore ผู้ใช้ที่ถูก Soft Delete
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await userService.restoreUser(id);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Failed to restore user:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
