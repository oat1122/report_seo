import { boardUrl } from './fixtures/blog-plan'
import { expect, test } from './fixtures/test'

test('ทีมเขียนเข้าได้เฉพาะ /blog — หน้า admin และหน้าลูกค้าถูกกัน', async ({ writerPage, ids }) => {
  await writerPage.goto(boardUrl.admin(ids.customerUserId))
  await expect(writerPage).toHaveURL(/\/unauthorized/)

  await writerPage.goto(boardUrl.customer(ids.customerUserId))
  await expect(writerPage).toHaveURL(/\/unauthorized/)
})

test('ลูกค้าเปิด workspace ของทีมเขียนไม่ได้', async ({ customerPage, ids }) => {
  await customerPage.goto(boardUrl.writer(ids.customerUserId))
  await expect(customerPage).toHaveURL(/\/unauthorized/)
})

// notFound() ถูกเรียกหลัง Next stream shell ออกไปแล้ว status จึงยังเป็น 200
// สิ่งที่ต้องการันตีคือ "บอร์ดไม่ถูกเรนเดอร์" ไม่ใช่ตัวเลข status
test('ลูกค้าเปิดแผนบทความของ user คนอื่นแล้วไม่เห็นบอร์ด', async ({ customerPage, ids }) => {
  await customerPage.goto(boardUrl.customer(ids.adminUserId))

  await expect(customerPage.getByRole('heading', { name: 'แผนบทความ', level: 1 })).toBeHidden()
  await expect(customerPage.getByRole('button', { name: 'เพิ่มบทความ' })).toBeHidden()
})

test('ยังไม่ล็อกอิน — ถูกส่งไปหน้าเข้าสู่ระบบ', async ({ page, ids }) => {
  await page.goto(boardUrl.writer(ids.customerUserId))
  await expect(page).toHaveURL(/(login|signin)/)
})

test('API แผนบทความปฏิเสธ request ที่ไม่มี session', async ({ request, ids }) => {
  const response = await request.get(`/api/customers/${ids.customerUserId}/blog-articles`)
  expect(response.status()).toBe(401)
})
