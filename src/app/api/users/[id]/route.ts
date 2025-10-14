import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/users/[id] - ดึงผู้ใช้รายบุคคล
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: params.id },
      include: {
        customerProfile: {
          select: {
            name: true,
            domain: true,
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
  { params }: { params: { id: string } }
) {
  try {
    const { name, email, role, companyName, domain } = await request.json();

    // ตรวจสอบว่า user มีอยู่จริงหรือไม่
    const existingUser = await prisma.user.findUnique({
      where: { id: params.id },
      include: { customerProfile: true },
    });

    if (!existingUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // ถ้า role เป็น CUSTOMER และมีการส่ง companyName หรือ domain มา
    if (role === "CUSTOMER" && (companyName || domain)) {
      const updatedUser = await prisma.$transaction(async (tx) => {
        // อัปเดต User
        const user = await tx.user.update({
          where: { id: params.id },
          data: { name, email, role },
        });

        // อัปเดตหรือสร้าง Customer profile
        if (existingUser.customerProfile) {
          // อัปเดต customer profile ที่มีอยู่
          await tx.customer.update({
            where: { userId: params.id },
            data: {
              name: companyName,
              domain: domain,
            },
          });
        } else {
          // สร้าง customer profile ใหม่ถ้ายังไม่มี
          await tx.customer.create({
            data: {
              name: companyName,
              domain: domain,
              userId: params.id,
            },
          });
        }

        return user;
      });

      return NextResponse.json(updatedUser);
    } else {
      // ถ้าไม่ใช่ CUSTOMER หรือไม่มีข้อมูล customer ให้อัปเดตแค่ User
      const updatedUser = await prisma.user.update({
        where: { id: params.id },
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
  { params }: { params: { id: string } }
) {
  try {
    await prisma.user.delete({
      where: { id: params.id },
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
