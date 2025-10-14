import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Role } from "@/types/auth";
import bcrypt from "bcrypt";

// GET /api/users - ดึงผู้ใช้ทั้งหมด
export async function GET() {
  try {
    const users = await prisma.user.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });
    return NextResponse.json(users);
  } catch (error) {
    console.error("Failed to fetch users:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// POST /api/users - สร้างผู้ใช้ใหม่ (อัปเดตแล้ว)
export async function POST(request: Request) {
  try {
    const { name, email, password, role, companyName, domain } =
      await request.json();

    if (!name || !email || !password || !role) {
      return NextResponse.json(
        { error: "Missing required user fields" },
        { status: 400 }
      );
    }

    // ถ้า Role เป็น CUSTOMER ต้องมี companyName และ domain ด้วย
    if (role === Role.CUSTOMER && (!companyName || !domain)) {
      return NextResponse.json(
        {
          error: "Company Name and Domain are required for CUSTOMER role",
        },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // ถ้าเป็น CUSTOMER ให้สร้าง User และ Customer พร้อมกันใน Transaction เดียว
    if (role === Role.CUSTOMER) {
      const newUserAndCustomer = await prisma.$transaction(async (tx) => {
        const newUser = await tx.user.create({
          data: {
            name,
            email,
            password: hashedPassword,
            role: role as Role,
          },
        });

        await tx.customer.create({
          data: {
            name: companyName,
            domain: domain,
            userId: newUser.id,
          },
        });

        return newUser;
      });
      return NextResponse.json(newUserAndCustomer, { status: 201 });
    } else {
      // ถ้าไม่ใช่ CUSTOMER ให้สร้างแค่ User
      const newUser = await prisma.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          role: role as Role,
        },
      });
      return NextResponse.json(newUser, { status: 201 });
    }
  } catch (error) {
    console.error("Failed to create user:", error);
    // ตรวจจับ error กรณี email หรือ domain ซ้ำ
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        { error: "Email or Domain already exists." },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
