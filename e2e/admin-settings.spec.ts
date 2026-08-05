import { db, resetBlogPlan } from './fixtures/db'
import { boardUrl, openBoard } from './fixtures/blog-plan'
import { expect, test } from './fixtures/test'

test.beforeEach(async ({ ids }) => {
  await resetBlogPlan(ids)
})

test('admin ตั้งโควตาต่อเดือนและมอบหมายผู้เขียน แล้วบอร์ดสะท้อนค่าใหม่', async ({
  adminPage,
  ids,
}) => {
  await openBoard(adminPage, boardUrl.admin(ids.customerUserId))

  // .first() เพราะ dev server เคยคืน DOM เก่า/ใหม่ซ้อนกันชั่วขณะตอน recompile
  // (โหลดบน server อุ่นแล้วมีใบเดียวเสมอ — ไม่ใช่ duplicate id ในโค้ดจริง)
  const quotaInput = adminPage.locator('#articles-per-month').first()
  await expect(quotaInput).toHaveValue('4')

  await quotaInput.fill('6')
  await adminPage.locator('#blog-writer').click()
  await adminPage.getByRole('option', { name: 'Blog Writer' }).click()
  await adminPage.getByRole('button', { name: 'บันทึก' }).click()

  await expect(adminPage.getByText(/โควตา 6 บทความ/)).toBeVisible()
  await expect(adminPage.getByText('ผู้เขียน: Blog Writer')).toBeVisible()

  await adminPage.reload()
  await expect(adminPage.locator('#articles-per-month').first()).toHaveValue('6')
  await expect(adminPage.getByText(/โควตา 6 บทความ/)).toBeVisible()

  const customer = await db.customer.findUnique({
    where: { id: ids.customerId },
    select: { articlesPerMonth: true, blogWriterId: true },
  })
  expect(customer?.articlesPerMonth).toBe(6)
  expect(customer?.blogWriterId).toBe(ids.writerUserId)
})

test('ยกเลิกการมอบหมายผู้เขียนได้', async ({ adminPage, ids }) => {
  await openBoard(adminPage, boardUrl.admin(ids.customerUserId))

  await adminPage.locator('#blog-writer').click()
  await adminPage.getByRole('option', { name: '— ยังไม่มอบหมาย —' }).click()
  await adminPage.getByRole('button', { name: 'บันทึก' }).click()

  await expect(adminPage.getByText(/^ผู้เขียน: /)).toBeHidden()

  const customer = await db.customer.findUnique({
    where: { id: ids.customerId },
    select: { blogWriterId: true },
  })
  expect(customer?.blogWriterId).toBeNull()
})
