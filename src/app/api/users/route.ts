import { NextRequest, NextResponse } from "next/server";
import { userService } from "@/services/UserService";

// GET /api/users - ดึงผู้ใช้ทั้งหมด
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const includeDeleted = searchParams.get("includeDeleted") === "true";

    const users = await userService.getUsers(includeDeleted);

    return NextResponse.json(users);
  } catch (error) {
    console.error("Failed to fetch users:", error);
    return NextResponse.json(
      { error: (error as Error).message || "Internal Server Error" },
      { status: 500 }
    );
  }
}

// POST /api/users - สร้างผู้ใช้ใหม่
export async function POST(request: Request) {
  try {
    const body = await request.json();

    const newUser = await userService.createUser(body);

    return NextResponse.json(newUser, { status: 201 });
  } catch (error) {
    console.error("Failed to create user:", error);

    const errorMessage = (error as Error).message;

    // Handle specific errors from service
    if (errorMessage.includes("Domain") || errorMessage.includes("Email")) {
      return NextResponse.json({ error: errorMessage }, { status: 409 });
    }
    if (errorMessage.includes("required")) {
      return NextResponse.json({ error: errorMessage }, { status: 400 });
    }

    // Handle Prisma unique constraint violation
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === "P2002"
    ) {
      const meta = (error as { meta?: { target?: string[] } }).meta;
      if (meta?.target?.includes("email")) {
        return NextResponse.json(
          { error: "Email already exists." },
          { status: 409 }
        );
      }
      return NextResponse.json(
        { error: "Duplicate data found." },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
