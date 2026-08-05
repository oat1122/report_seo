import { unlink } from 'fs/promises'
import path from 'path'
import { PrismaClient } from '@prisma/client'

const UPLOAD_DIR = path.resolve(process.cwd(), 'public/uploads/blog-plan')

// PrismaClient ดิบ (ไม่ผ่าน extension ของแอป) — helper เทสต์ไม่ต้องการ soft-delete/history
// DATABASE_URL ถูก playwright.config โหลดจาก .env.test มาแล้ว
export const db = new PrismaClient()

export const SEED_EMAIL = {
  admin: 'admin@report.com',
  customer: 'customer@report.com',
  writer: 'blog.writer@report.com',
} as const

export interface E2EFixtureIds {
  /** id ของ User role CUSTOMER — ใช้เป็น param ใน URL ทุกหน้า blog-plan */
  customerUserId: string
  adminUserId: string
  writerUserId: string
  /** id ของ Customer profile — ใช้ query ข้อมูลรายงาน */
  customerId: string
}

export async function loadFixtureIds(): Promise<E2EFixtureIds> {
  const [admin, customerUser, writer] = await Promise.all([
    db.user.findUnique({ where: { email: SEED_EMAIL.admin }, select: { id: true } }),
    db.user.findUnique({
      where: { email: SEED_EMAIL.customer },
      select: { id: true, customerProfile: { select: { id: true } } },
    }),
    db.user.findUnique({ where: { email: SEED_EMAIL.writer }, select: { id: true } }),
  ])

  if (!admin || !customerUser?.customerProfile || !writer) {
    throw new Error(
      'DB เทสต์ยังไม่ถูก seed — รัน:\n' +
        '  npx dotenv -e .env.test -- npx prisma migrate deploy\n' +
        '  npx dotenv -e .env.test -- npx tsx prisma/seed.ts',
    )
  }

  return {
    adminUserId: admin.id,
    customerUserId: customerUser.id,
    customerId: customerUser.customerProfile.id,
    writerUserId: writer.id,
  }
}

/**
 * ลบบทความของลูกค้าทดสอบพร้อมไฟล์จริงบนดิสก์
 * ต้องอ่าน url ก่อนลบแถว เพราะ cascade จะพา blogArticleFile หายไปด้วย
 * แล้วไฟล์ใน public/uploads/blog-plan จะกลายเป็นขยะกำพร้าที่ไม่มีใครรู้จัก
 */
export async function purgeBlogArticles(ids: E2EFixtureIds): Promise<void> {
  const files = await db.blogArticleFile.findMany({
    where: { article: { customerId: ids.customerId } },
    select: { url: true },
  })

  await db.blogArticle.deleteMany({ where: { customerId: ids.customerId } })

  for (const file of files) {
    const absolutePath = path.resolve(process.cwd(), 'public', file.url.replace(/^\//, ''))
    if (!absolutePath.startsWith(UPLOAD_DIR + path.sep)) continue
    await unlink(absolutePath).catch(() => {})
  }
}

/** ตั้งต้นให้ทุก spec เริ่มจากสถานะเดียวกัน — ล้างบทความและคืนค่า settings เป็นค่า seed */
export async function resetBlogPlan(ids: E2EFixtureIds): Promise<void> {
  await purgeBlogArticles(ids)
  await db.customer.update({
    where: { id: ids.customerId },
    data: { articlesPerMonth: 4, blogWriterId: ids.writerUserId },
  })
}

/** seed.ts ไม่ได้สร้าง keyword ให้ลูกค้า — KeywordPicker จึงต้องมีข้อมูลจากตรงนี้ */
export async function ensureKeyword(ids: E2EFixtureIds, keyword: string): Promise<void> {
  const existing = await db.keywordReport.findFirst({
    where: { customerId: ids.customerId, keyword },
    select: { id: true },
  })
  if (existing) return

  await db.keywordReport.create({
    data: { customerId: ids.customerId, keyword, position: 7, traffic: 120, kd: 'MEDIUM' },
  })
}
