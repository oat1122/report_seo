import { db, resetBlogPlan } from './fixtures/db'
import { FIXTURE_FILE } from './fixtures/constants'
import {
  approveStage,
  articleCard,
  boardUrl,
  createArticle,
  expectStatus,
  openBoard,
  openFilesTab,
  submitStage,
  todayInputValue,
} from './fixtures/blog-plan'
import { expect, test } from './fixtures/test'

const TITLE = 'E2E · ไฟล์แนบทุกเวอร์ชัน'

test.beforeEach(async ({ ids }) => {
  await resetBlogPlan(ids)
})

test('อัปโหลดไฟล์จริง ลูกค้าดาวน์โหลดได้ และเก็บครบทุกเวอร์ชัน', async ({
  writerPage,
  customerPage,
  ids,
}) => {
  await openBoard(writerPage, boardUrl.writer(ids.customerUserId))
  await createArticle(writerPage, { title: TITLE, startDate: todayInputValue() })

  let writerCard = articleCard(writerPage, TITLE)
  await submitStage(writerPage, writerCard, {
    stageLabel: 'ส่งหัวข้อ / Main Idea',
    message: 'แนบไฟล์หัวข้อมาให้ดู',
    filePath: FIXTURE_FILE.articleDoc,
  })

  // ลูกค้าเห็นไฟล์ในแท็บ "ไฟล์ทั้งหมด" และดาวน์โหลดได้จริง
  await openBoard(customerPage, boardUrl.customer(ids.customerUserId))
  const customerCard = articleCard(customerPage, TITLE)
  await openFilesTab(customerCard)

  const downloadLink = customerCard.getByRole('link', { name: /^ดาวน์โหลด / })
  await expect(downloadLink).toHaveCount(1)
  await expect(customerCard.getByText(/เวอร์ชัน 1/)).toBeVisible()

  const href = await downloadLink.getAttribute('href')
  expect(href).toMatch(/^\/uploads\/blog-plan\//)
  const downloaded = await customerPage.request.get(href ?? '')
  expect(downloaded.status()).toBe(200)
  expect(downloaded.headers()['content-type']).toContain('pdf')

  // ลูกค้าอนุมัติหัวข้อ → ทีมส่งบทความพร้อมไฟล์ใบที่สอง → version เดินเป็น 2
  await approveStage(customerCard)
  await writerPage.reload()
  writerCard = articleCard(writerPage, TITLE)
  await submitStage(writerPage, writerCard, {
    stageLabel: 'ส่งบทความฉบับเต็ม',
    message: 'บทความฉบับเต็ม',
    filePath: FIXTURE_FILE.articleDoc,
  })

  // รอสถานะนิ่งก่อน — การ์ดจะย้าย section แล้ว remount ปิดแท็บที่เพิ่งเปิดทิ้ง
  await expectStatus(writerCard, 'รอลูกค้าตอบ')
  await openFilesTab(writerCard)
  await expect(writerCard.getByText(/เวอร์ชัน 2/)).toBeVisible()
  await expect(writerCard.getByRole('link', { name: /^ดาวน์โหลด / })).toHaveCount(2)

  const files = await db.blogArticleFile.findMany({
    where: { article: { customerId: ids.customerId } },
    select: { version: true, kind: true, mimeType: true },
    orderBy: { version: 'asc' },
  })
  expect(files).toHaveLength(2)
  expect(files.map((file) => file.version)).toEqual([1, 2])
  expect(files.every((file) => file.kind === 'ARTICLE_DOC')).toBe(true)

  // ทีมเขียนลบไฟล์เวอร์ชันล่าสุดออกได้
  await writerCard.getByRole('button', { name: /^ลบ / }).first().click()
  await expect(writerCard.getByRole('link', { name: /^ดาวน์โหลด / })).toHaveCount(1)

  const remaining = await db.blogArticleFile.count({
    where: { article: { customerId: ids.customerId } },
  })
  expect(remaining).toBe(1)
})
