import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Role } from "@/types/auth";
import bcrypt from "bcrypt";

// GET /api/users - ดึงผู้ใช้ทั้งหมด
export async function GET(request: NextRequest) {
  try {
    // อ่าน query parameter จาก URL
    const { searchParams } = new URL(request.url);
    const includeDeleted = searchParams.get('includeDeleted') === 'true';

    const users = await (prisma as any).user.findMany({
      // ส่ง property `includeDeleted` ไปให้ middleware
      includeDeleted: includeDeleted,
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
      // ตรวจสอบว่า domain ซ้ำหรือไม่ก่อนสร้าง
      const existingCustomer = await prisma.customer.findUnique({
        where: { domain: domain },
      });

      if (existingCustomer) {
        return NextResponse.json(
          {
            error: `Domain "${domain}" is already registered to another customer.`,
          },
          { status: 409 }
        );
      }

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
    // ตรวจจับ error กรณี email ซ้ำ (เนื่องจาก domain เราเช็คไปแล้วด้านบน)
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === "P2002"
    ) {
      // ถ้าเป็น Unique constraint ให้ดูว่า field ไหน
      const meta = (error as any).meta;
      if (meta?.target?.includes("email")) {
        return NextResponse.json(
          { error: "Email already exists." },
          { status: 409 }
        );
      }
      // กรณีอื่นๆ
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
