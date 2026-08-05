import { expect, type Locator, type Page } from '@playwright/test'

export const boardUrl = {
  writer: (userId: string) => `/blog/customers/${userId}`,
  customer: (userId: string) => `/customer/${userId}/blog-plan`,
  admin: (userId: string) => `/admin/customers/${userId}/blog-plan`,
} as const

export async function openBoard(page: Page, url: string): Promise<void> {
  await page.goto(url)
  await expect(page.getByRole('heading', { name: 'แผนบทความ', level: 1 })).toBeVisible()
}

/** การ์ดบทความใบที่มีหัวข้อนี้ — ไทม์ไลน์เขียนหัวข้อเป็น span จึงกรองด้วย heading ได้ตรงใบ */
export function articleCard(page: Page, title: string): Locator {
  return page
    .locator('[data-slot="card"]')
    .filter({ has: page.getByRole('heading', { name: title }) })
}

export async function expectStatus(card: Locator, label: string): Promise<void> {
  await expect(card.getByText(label, { exact: true }).first()).toBeVisible()
}

/**
 * การ์ดที่ไม่ใช่งานของ role ปัจจุบันจะถูกย่อไว้ — ต้องกางก่อนถึงจะเห็นปุ่มใน thread
 * เช็ค/คลิกซ้ำเป็นรอบ เพราะ refetch หลัง mutation ทำให้การ์ดสลับ section แล้ว remount กลับมาย่อ
 */
export async function expandCard(card: Locator): Promise<void> {
  const tab = card.getByRole('tab', { name: /การพูดคุย/ })

  await expect(async () => {
    if (await tab.isVisible()) return

    // การ์ดที่กางอยู่แล้วปุ่มจะเขียนว่า "ย่อ" — ห้ามสั่งคลิกลอย ๆ ไม่งั้นค้างรอปุ่มที่ไม่มี
    const toggle = card.getByRole('button', { name: 'ดูรายละเอียด' })
    if (await toggle.isVisible()) await toggle.click({ timeout: 5_000 })
    await expect(tab).toBeVisible({ timeout: 3_000 })
  }).toPass({ timeout: 30_000 })

  // Radix unmount แท็บที่ไม่ active — ปุ่มส่งงาน/อนุมัติอยู่ในแท็บ "การพูดคุย" เท่านั้น
  if ((await tab.getAttribute('aria-selected')) !== 'true') await tab.click()
}

interface CreateArticleInput {
  title: string
  keyword?: string
  /** yyyy-mm-dd — ใส่แล้วระบบจะไล่ dueDate ให้ครบ 7 ขั้น */
  startDate?: string
}

export async function createArticle(
  page: Page,
  { title, keyword, startDate }: CreateArticleInput,
): Promise<void> {
  // เดือนที่ว่างมีปุ่ม "เพิ่มบทความ" ทั้งบนหัวบอร์ดและใน empty state
  await page.getByRole('button', { name: 'เพิ่มบทความ' }).first().click()

  const dialog = page.getByRole('dialog')
  await dialog.locator('#article-title').fill(title)
  if (startDate) await dialog.locator('#article-start-date').fill(startDate)
  if (keyword) await dialog.getByRole('button', { name: new RegExp(keyword, 'i') }).click()
  await dialog.getByRole('button', { name: 'เพิ่มบทความ' }).click()

  await expect(dialog).toBeHidden()
  await expect(articleCard(page, title)).toBeVisible()
}

interface SubmitStageInput {
  /** ป้ายชื่อ stage บนปุ่มส่งงาน เช่น "ส่งหัวข้อ / Main Idea" */
  stageLabel: string
  message: string
  linkUrl?: string
  filePath?: string
}

/** ทีมเขียนส่งงาน 1 รอบผ่าน StageSubmitDialog */
export async function submitStage(
  page: Page,
  card: Locator,
  { stageLabel, message, linkUrl, filePath }: SubmitStageInput,
): Promise<void> {
  await expandCard(card)
  await card.getByRole('button', { name: `ส่งงาน: ${stageLabel}` }).click()

  const dialog = page.getByRole('dialog')
  await dialog.locator('#submit-message').fill(message)
  if (linkUrl) await dialog.locator('#submit-link').fill(linkUrl)
  if (filePath) await dialog.locator('input[type="file"]').setInputFiles(filePath)
  await dialog.getByRole('button', { name: 'ส่งให้ลูกค้า' }).click()

  await expect(dialog).toBeHidden()
}

export async function approveStage(card: Locator): Promise<void> {
  await expandCard(card)
  await card.getByRole('button', { name: 'อนุมัติเลย' }).click()
}

export async function requestChanges(page: Page, card: Locator, comment: string): Promise<void> {
  await expandCard(card)
  await card.getByRole('button', { name: 'ขอแก้ไข' }).click()

  const dialog = page.getByRole('dialog')
  await dialog.locator('#feedback-comment').fill(comment)
  await dialog.getByRole('button', { name: 'ส่งให้ทีมแก้' }).click()

  await expect(dialog).toBeHidden()
}

export async function openFilesTab(card: Locator): Promise<void> {
  await expandCard(card)
  await card.getByRole('tab', { name: /ไฟล์ทั้งหมด/ }).click()
}

/** yyyy-mm-dd ของวันนี้ — startDate ของบทความทดสอบ */
export function todayInputValue(): string {
  const now = new Date()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${now.getFullYear()}-${month}-${day}`
}
