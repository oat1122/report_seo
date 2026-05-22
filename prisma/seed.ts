// Note: Ensure prisma/schema.prisma has @@map("table_name") if your database uses lowercase table names (e.g. from a dump).
import { PrismaClient } from "@prisma/client";
import { randomUUID } from "crypto"; // ใช้ในกรณีที่อยาก set UUID เอง
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  console.log("▶ เริ่มต้น Seed ข้อมูล...");

  // Hash password สำหรับทุก user
  const hashedPassword = await bcrypt.hash("password123", 10);

  // 1️ สร้าง ADMIN User
  const adminUser = await prisma.user.upsert({
    where: { email: "admin@report.com" },
    update: {
      password: hashedPassword, // Force update password
      name: "System Admin",
      role: "ADMIN",
    },
    create: {
      id: randomUUID(), //  เพิ่ม UUID เองได้ หรือปล่อยให้ Prisma สร้างก็ได้
      name: "System Admin",
      email: "admin@report.com",
      password: hashedPassword,
      role: "ADMIN",
    },
  });

  // 2️ สร้าง SEO_DEV User
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

  // 3️ สร้าง CUSTOMER User
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

  // 4⃣ สร้าง Customer Profile และเชื่อมโยงกับ SEO_DEV + CUSTOMER
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

  // 5️ Work Progress master tables (Phase 1)
  // หมวดหมู่งาน SEO 7 หมวด (จาก CSV SEO_Work_Progress_2026_12Months) — isSystem ลบไม่ได้
  const wpCategories = [
    { code: "KEYWORD_INTENT", name: "Keyword & Intent", icon: "Search", orderIndex: 1 },
    { code: "SETUP_TRACKING", name: "SETUP GSC / Analytics / TAG", icon: "Settings", orderIndex: 2 },
    { code: "ON_PAGE_SEO", name: "On-Page SEO", icon: "FileText", orderIndex: 3 },
    { code: "TECHNICAL_SEO", name: "Technical SEO", icon: "Wrench", orderIndex: 4 },
    { code: "OFF_PAGE_BACKLINKS", name: "Off-Page (Backlinks)", icon: "Link", orderIndex: 5 },
    { code: "MONITORING_AUDIT", name: "Monitoring & Audit", icon: "Activity", orderIndex: 6 },
    { code: "REPORT", name: "Report", icon: "FileBarChart", orderIndex: 7 },
  ];
  for (const c of wpCategories) {
    await prisma.workProgressCategory.upsert({
      where: { code: c.code },
      update: { name: c.name, icon: c.icon, orderIndex: c.orderIndex, isSystem: true, isActive: true },
      create: { ...c, isSystem: true, isActive: true },
    });
  }

  // 5 สถานะ — NOT_STARTED = default, COMPLETED + CANCELLED = terminal
  const wpStatuses = [
    { code: "NOT_STARTED", name: "ยังไม่เริ่ม", orderIndex: 1, isDefault: true, isTerminal: false },
    { code: "IN_PROGRESS", name: "กำลังดำเนินการ", color: "#9592ff", orderIndex: 2, isDefault: false, isTerminal: false },
    { code: "COMPLETED", name: "เสร็จสิ้น", color: "#31fb4c", orderIndex: 3, isDefault: false, isTerminal: true },
    { code: "ON_HOLD", name: "ระงับชั่วคราว", orderIndex: 4, isDefault: false, isTerminal: false },
    { code: "CANCELLED", name: "ยกเลิก", orderIndex: 5, isDefault: false, isTerminal: true },
  ];
  for (const s of wpStatuses) {
    await prisma.workProgressStatus.upsert({
      where: { code: s.code },
      update: { name: s.name, orderIndex: s.orderIndex, isDefault: s.isDefault, isTerminal: s.isTerminal, color: s.color ?? null, isSystem: true, isActive: true },
      create: { ...s, color: s.color ?? null, isSystem: true, isActive: true },
    });
  }

  // 4 ประเภทเครื่องหมายเซลล์ (Mark Type)
  const wpMarkTypes = [
    { code: "PLANNED", name: "วางแผน", orderIndex: 1 },
    { code: "IN_PROGRESS", name: "กำลังทำ", color: "#9592ff", orderIndex: 2 },
    { code: "COMPLETED", name: "เสร็จแล้ว", color: "#31fb4c", orderIndex: 3 },
    { code: "MISSED", name: "พลาด", orderIndex: 4 },
  ];
  for (const m of wpMarkTypes) {
    await prisma.workProgressMarkType.upsert({
      where: { code: m.code },
      update: { name: m.name, orderIndex: m.orderIndex, color: m.color ?? null, isSystem: true, isActive: true },
      create: { ...m, color: m.color ?? null, isSystem: true, isActive: true },
    });
  }

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
  console.log("--- Work Progress masters ---");
  console.table({
    Categories: wpCategories.length,
    Statuses: wpStatuses.length,
    MarkTypes: wpMarkTypes.length,
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
