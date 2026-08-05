import { test as base, type Page } from '@playwright/test'
import { STORAGE_STATE } from '../../playwright.config'
import { loadFixtureIds, type E2EFixtureIds } from './db'

interface E2EFixtures {
  writerPage: Page
  customerPage: Page
  adminPage: Page
}

interface E2EWorkerFixtures {
  ids: E2EFixtureIds
}

// ชื่อ callback ของ fixture ตั้งเป็น `provide` ไม่ใช่ `use` ตามตัวอย่าง playwright
// เพราะ eslint react-hooks มองว่า `use(...)` คือ React hook แล้วฟ้อง rules-of-hooks
export const test = base.extend<E2EFixtures, E2EWorkerFixtures>({
  ids: [
    async ({}, provide) => {
      await provide(await loadFixtureIds())
    },
    { scope: 'worker' },
  ],
  writerPage: async ({ browser }, provide) => {
    const context = await browser.newContext({ storageState: STORAGE_STATE.writer })
    await provide(await context.newPage())
    await context.close()
  },
  customerPage: async ({ browser }, provide) => {
    const context = await browser.newContext({ storageState: STORAGE_STATE.customer })
    await provide(await context.newPage())
    await context.close()
  },
  adminPage: async ({ browser }, provide) => {
    const context = await browser.newContext({ storageState: STORAGE_STATE.admin })
    await provide(await context.newPage())
    await context.close()
  },
})

export { expect } from '@playwright/test'
