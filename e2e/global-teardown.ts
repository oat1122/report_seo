import { db, loadFixtureIds, purgeBlogArticles } from './fixtures/db'

/** เก็บกวาดรอบสุดท้าย — บทความและไฟล์ที่ spec ตัวท้ายทิ้งไว้ */
export default async function globalTeardown() {
  try {
    await purgeBlogArticles(await loadFixtureIds())
  } finally {
    await db.$disconnect()
  }
}
