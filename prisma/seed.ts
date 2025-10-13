import { PrismaClient } from "@prisma/client";
import { randomUUID } from "crypto"; // ใช้ในกรณีที่อยาก set UUID เอง
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  console.log("▶️ เริ่มต้น Seed ข้อมูล...");

  // Hash password สำหรับทุก user
  const hashedPassword = await bcrypt.hash("password123", 10);

  // 1️⃣ สร้าง ADMIN User
  const adminUser = await prisma.user.upsert({
    where: { email: "admin@report.com" },
    update: {
      password: hashedPassword, // Force update password
      name: "System Admin",
      role: "ADMIN",
    },
    create: {
      id: randomUUID(), // ❗ เพิ่ม UUID เองได้ หรือปล่อยให้ Prisma สร้างก็ได้
      name: "System Admin",
      email: "admin@report.com",
      password: hashedPassword,
      role: "ADMIN",
    },
  });

  // 2️⃣ สร้าง SEO_DEV User
  const seoDevUser = await prisma.user.upsert({
    where: { email: "seo.dev@report.com" },
    update: {
      password: hashedPassword, // Force update password
      name: "SEO Developer",
      role: "SEO_DEV",
    },
    create: {
      id: randomUUID(),
      name: "SEO Developer",
      email: "seo.dev@report.com",
      password: hashedPassword,
      role: "SEO_DEV",
    },
  });

  // 3️⃣ สร้าง CUSTOMER User
  const customerUser = await prisma.user.upsert({
    where: { email: "customer@report.com" },
    update: {
      password: hashedPassword, // Force update password
      name: "Test Customer",
      role: "CUSTOMER",
    },
    create: {
      id: randomUUID(),
      name: "Test Customer",
      email: "customer@report.com",
      password: hashedPassword,
      role: "CUSTOMER",
    },
  });

  // 4️⃣ สร้าง Customer Profile และเชื่อมโยงกับ SEO_DEV + CUSTOMER
  const customerProfile = await prisma.customer.upsert({
    where: { domain: "www.my-domain-report.com" },
    update: {},
    create: {
      id: randomUUID(),
      name: "Thanaplus Co., Ltd.",
      domain: "www.my-domain-report.com",
      // เชื่อมกับ user/customer
      user: {
        connect: { id: customerUser.id },
      },
      // เชื่อมกับ seoDev (ผู้ดูแล)
      seoDev: {
        connect: { id: seoDevUser.id },
      },
    },
  });

  console.log(" Seed ข้อมูลเสร็จสมบูรณ์");
  console.log("--- ข้อมูลผู้ใช้งานหลัก ---");
  console.table({
    Admin: adminUser.email,
    SeoDev: seoDevUser.email,
    Customer: customerUser.email,
  });
  console.log("--- ข้อมูลลูกค้า ---");
  console.table({
    CustomerDomain: customerProfile.domain,
    AssignedSeoDev: seoDevUser.email,
  });
}

main()
  .catch((e) => {
    console.error(" เกิดข้อผิดพลาดในการ Seed ข้อมูล", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
