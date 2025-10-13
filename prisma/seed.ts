import { PrismaClient } from "@prisma/client";

// สร้าง PrismaClient instance ใหม่สำหรับ Seeder
const prisma = new PrismaClient();

async function main() {
  console.log("▶️ เริ่มต้น Seed ข้อมูล...");

  // ⚠️ คำเตือน: ในการใช้งานจริง ควรทำการ Hash รหัสผ่านก่อนบันทึก (เช่น ใช้ bcrypt)

  // 1. Seed: ADMIN User
  const adminUser = await prisma.user.upsert({
    where: { email: "admin@report.com" },
    update: {},
    create: {
      email: "admin@report.com",
      password: "password123",
      role: "ADMIN",
    },
  });

  // 2. Seed: SEO_DEV User (ผู้ดูแล)
  const seoDevUser = await prisma.user.upsert({
    where: { email: "seo.dev@report.com" },
    update: {},
    create: {
      email: "seo.dev@report.com",
      password: "password123",
      role: "SEO_DEV",
    },
  });

  // 3. Seed: CUSTOMER User (บัญชีลูกค้า)
  const customerUser = await prisma.user.upsert({
    where: { email: "customer@report.com" },
    update: {},
    create: {
      email: "customer@report.com",
      password: "password123",
      role: "CUSTOMER",
    },
  });

  // 4. Seed: Customer Profile และเชื่อมโยงกับ SEO_DEV และ CUSTOMER User
  const customerProfile = await prisma.customer.upsert({
    where: { domain: "www.my-domain-report.com" },
    update: {},
    create: {
      name: "Thanaplus Co., Ltd.",
      domain: "www.my-domain-report.com",
      // เชื่อมกับบัญชีผู้ใช้ที่เป็น CUSTOMER
      user: {
        connect: { id: customerUser.id },
      },
      // เชื่อมกับบัญชีผู้ใช้ที่เป็น SEO_DEV (ผู้ดูแล)
      seoDev: {
        connect: { id: seoDevUser.id },
      },
    },
  });

  console.log("✅ Seed ข้อมูลเสร็จสมบูรณ์");
  console.log("--- ข้อมูลผู้ใช้งานหลัก ---");
  console.log({
    Admin: adminUser.email,
    SeoDev: seoDevUser.email,
    Customer: customerUser.email,
  });
  console.log("--- ข้อมูลลูกค้า ---");
  console.log({
    CustomerDomain: customerProfile.domain,
    AssignedSeoDev: seoDevUser.email,
  });
}

main()
  .catch((e) => {
    console.error("❌ เกิดข้อผิดพลาดในการ Seed ข้อมูล", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
