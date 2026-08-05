import { mkdir } from 'fs/promises'
import path from 'path'
import { chromium, expect, type FullConfig } from '@playwright/test'
import { STORAGE_STATE } from '../playwright.config'
import { E2E_KEYWORD } from './fixtures/constants'
import { SEED_EMAIL, db, ensureKeyword, loadFixtureIds, resetBlogPlan } from './fixtures/db'

const PASSWORD = 'password123'

/** หน้าแรกของแต่ละ role — เข้าเองหลังยืนยัน session แล้ว */
const LANDING = {
  admin: '/admin',
  customer: '/customer',
  writer: '/blog',
} as const

const EXPECTED_ROLE = {
  admin: 'ADMIN',
  customer: 'CUSTOMER',
  writer: 'BLOG_WRITER',
} as const

export default async function globalSetup(config: FullConfig) {
  const baseURL = config.projects[0].use.baseURL
  if (!baseURL) throw new Error('baseURL หายจาก playwright config')

  const ids = await loadFixtureIds()
  await resetBlogPlan(ids)
  await ensureKeyword(ids, E2E_KEYWORD)
  await db.$disconnect()

  await mkdir(path.dirname(STORAGE_STATE.admin), { recursive: true })

  const browser = await chromium.launch()
  try {
    for (const role of ['admin', 'customer', 'writer'] as const) {
      const page = await browser.newPage({ baseURL })

      // dev server คอมไพล์ /login ตอนถูกเรียกครั้งแรก ถ้ากดปุ่มก่อน React hydrate
      // ฟอร์มจะยังไม่มี onSubmit → signIn() ไม่ถูกเรียกเลย
      // SessionProvider ยิง /api/auth/session ตอน mount — ใช้เป็นสัญญาณว่า hydrate แล้ว
      const hydrated = page.waitForResponse(
        (response) => response.url().includes('/api/auth/session'),
        { timeout: 120_000 },
      )
      await page.goto('/login')
      await hydrated

      await page.locator('#email').fill(SEED_EMAIL[role])
      await page.locator('#password').fill(PASSWORD)
      await page.getByRole('button', { name: 'เข้าสู่ระบบ' }).click()

      // LoginForm เด้งไป /dashboard (route ที่ไม่มีจริง) ถ้า getSession() คืน role ไม่ทัน
      // จึงยืนยันสิทธิ์จาก session endpoint ตรง ๆ แทนการรอ redirect ของแอป
      await expect
        .poll(
          async () => {
            const response = await page.request.get('/api/auth/session')
            const session = (await response.json()) as { user?: { role?: string } }
            return session?.user?.role ?? null
          },
          { timeout: 60_000, message: `ล็อกอิน ${role} แล้วแต่ session ไม่มี role` },
        )
        .toBe(EXPECTED_ROLE[role])

      await page.goto(LANDING[role])
      await expect(page).toHaveURL(new RegExp(`${LANDING[role]}(/|$)`))

      await page.context().storageState({ path: STORAGE_STATE[role] })
      await page.close()
    }
  } finally {
    await browser.close()
  }
}
