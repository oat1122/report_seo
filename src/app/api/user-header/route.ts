import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth-utils"; // Utility สำหรับดึง session

// GET /api/user-header
// ดึงข้อมูล User และ Customer ของผู้ใช้ที่ล็อกอินอยู่
export async function GET() {
  // 1. ดึงข้อมูล session ของผู้ใช้ที่ล็อกอินอยู่
  const session = await getSession();

  // 2. ถ้าไม่มี session หรือไม่มี user ให้ return error
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  console.log("🔍 Searching for user with userId:", session.user.id);

  try {
    // 3. ดึงข้อมูล User พร้อม role เพื่อตรวจสอบประเภทผู้ใช้
    const user = await prisma.user.findUnique({
      where: {
        id: session.user.id,
      },
      select: {
        name: true,
        role: true,
        // ดึงข้อมูล Customer profile ถ้าเป็น CUSTOMER
        customerProfile: {
          select: {
            domain: true,
          },
        },
      },
    });

    if (!user) {
      console.log("❌ No user found for userId:", session.user.id);
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    console.log("✅ Found user:", user);

    // 4. จัดรูปแบบข้อมูลตาม Role
    const headerData: {
      userName: string | null;
      userRole: string;
      domain: string | null;
    } = {
      userName: user.name,
      userRole: user.role,
      domain: null,
    };

    // ถ้าเป็น CUSTOMER ให้เพิ่มข้อมูล domain
    if (user.role === "CUSTOMER" && user.customerProfile) {
      headerData.domain = user.customerProfile.domain;
    } else if (user.role === "CUSTOMER" && !user.customerProfile) {
      // CUSTOMER แต่ไม่มี profile
      console.log("⚠️ Customer user without profile:", session.user.id);
      headerData.domain = "No domain assigned";
    }
    // ADMIN หรือ SEO_DEV จะมี domain เป็น null

    // 6. ส่งข้อมูลกลับไปเป็น JSON
    return NextResponse.json(headerData);
  } catch (error) {
    console.error("Failed to fetch user header data:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
