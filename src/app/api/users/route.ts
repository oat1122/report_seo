import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Role } from "@/types/auth";
import bcrypt from "bcrypt";

// GET /api/users - ดึงผู้ใช้ทั้งหมด (ไม่มีการแก้ไข)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const includeDeleted = searchParams.get("includeDeleted") === "true";

    // Note: includeDeleted is a custom property handled by Prisma extension
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const users = await (prisma as any).user.findMany({
      includeDeleted: includeDeleted,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        customerProfile: {
          select: {
            seoDevId: true,
          },
        },
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
    // FIX 1: เพิ่ม seoDevId ในการ destructure
    const { name, email, password, role, companyName, domain, seoDevId } =
      await request.json();

    if (!name || !email || !password || !role) {
      return NextResponse.json(
        { error: "Missing required user fields" },
        { status: 400 }
      );
    }

    if (role === Role.CUSTOMER && (!companyName || !domain)) {
      return NextResponse.json(
        {
          error: "Company Name and Domain are required for CUSTOMER role",
        },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    if (role === Role.CUSTOMER) {
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
            // FIX 2: เพิ่ม seoDevId ตอนสร้าง customer
            seoDevId: seoDevId || null,
          },
        });

        //         เพื่อให้ข้อมูลที่ส่งกลับไปสมบูรณ์
        const userWithProfile = await tx.user.findUnique({
          where: { id: newUser.id },
          include: {
            customerProfile: {
              select: {
                seoDevId: true,
              },
            },
          },
        });

        return userWithProfile;
      });
      return NextResponse.json(newUserAndCustomer, { status: 201 });
    } else {
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

    // Type error safely for Prisma unique constraint violation
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === "P2002" &&
      "meta" in error &&
      typeof (error as { meta?: { target?: string[] } }).meta?.target
        ?.includes === "function"
    ) {
      const meta = (error as { meta: { target: string[] } }).meta;
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
