import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Role } from "@/types/auth";

// GET /api/users/[id] - ดึงผู้ใช้รายบุคคล
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        customerProfile: {
          select: {
            name: true,
            domain: true,
            seoDevId: true, // เพิ่ม field นี้
          },
        },
      },
    });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    return NextResponse.json(user);
  } catch (error) {
    console.error("Failed to fetch user:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// PUT /api/users/[id] - อัปเดตผู้ใช้
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    // เพิ่ม seoDevId เข้ามา
    const { name, email, role, companyName, domain, seoDevId } =
      await request.json();

    // ตรวจสอบว่า user มีอยู่จริงหรือไม่
    const existingUser = await prisma.user.findUnique({
      where: { id },
      include: { customerProfile: true },
    });

    if (!existingUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // ถ้า role เป็น CUSTOMER และมีการส่ง companyName หรือ domain มา
    if (role === Role.CUSTOMER && (companyName || domain)) {
      // ตรวจสอบว่า domain ซ้ำกับ customer อื่นหรือไม่ (ถ้ามีการเปลี่ยน domain)
      if (domain) {
        const existingCustomerWithDomain = await prisma.customer.findFirst({
          where: {
            domain: domain,
            userId: { not: id }, // ไม่นับ customer ของตัวเอง
          },
        });

        if (existingCustomerWithDomain) {
          return NextResponse.json(
            {
              error: `Domain "${domain}" is already registered to another customer.`,
            },
            { status: 409 }
          );
        }
      }

      const updatedUser = await prisma.$transaction(async (tx) => {
        // อัปเดต User
        const user = await tx.user.update({
          where: { id },
          data: { name, email, role },
        });

        // เตรียมข้อมูลสำหรับอัปเดต Customer
        const customerData: {
          name?: string;
          domain?: string;
          seoDevId?: string | null;
        } = {};
        if (companyName) customerData.name = companyName;
        if (domain) customerData.domain = domain;
        // ถ้ามี seoDevId ส่งมา (แม้จะเป็นค่าว่าง) ให้ทำการอัปเดต
        if (seoDevId !== undefined) {
          customerData.seoDevId = seoDevId === "" ? null : seoDevId;
        }

        // อัปเดตหรือสร้าง Customer profile
        if (existingUser.customerProfile) {
          // อัปเดต customer profile ที่มีอยู่
          await tx.customer.update({
            where: { userId: id },
            data: customerData,
          });
        } else {
          // สร้าง customer profile ใหม่ถ้ายังไม่มี
          await tx.customer.create({
            data: {
              name: companyName,
              domain: domain,
              userId: id,
              seoDevId: seoDevId || null,
            },
          });
        }

        return user;
      });

      return NextResponse.json(updatedUser);
    } else {
      // ถ้าไม่ใช่ CUSTOMER หรือไม่มีข้อมูล customer ให้อัปเดตแค่ User
      const updatedUser = await prisma.user.update({
        where: { id },
        data: { name, email, role },
      });
      return NextResponse.json(updatedUser);
    }
  } catch (error) {
    console.error("Failed to update user:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// DELETE /api/users/[id] - ลบผู้ใช้ (จะถูกเปลี่ยนเป็น Soft Delete โดย Middleware)
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.user.delete({
      where: { id },
    });
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Failed to delete user:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
