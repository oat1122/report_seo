import path from 'path'
import { config as loadEnv } from 'dotenv'
import { defineConfig, devices } from '@playwright/test'

// .env ให้ NEXTAUTH_SECRET, .env.test ทับ DATABASE_URL/NEXTAUTH_URL มาที่ DB เทสต์
loadEnv({ path: '.env' })
loadEnv({ path: '.env.test', override: true })

const PORT = 3001
const baseURL = `http://localhost:${PORT}`

export const E2E_DIR = path.resolve(__dirname, 'e2e')
export const STORAGE_STATE = {
  admin: path.join(E2E_DIR, '.auth/admin.json'),
  customer: path.join(E2E_DIR, '.auth/customer.json'),
  writer: path.join(E2E_DIR, '.auth/writer.json'),
} as const

export default defineConfig({
  testDir: './e2e',
  // DB เดียว ลูกค้าเดียว — รันขนานเมื่อไรบทความของแต่ละ spec ชนกันทันที
  workers: 1,
  fullyParallel: false,
  retries: 0,
  // dev server คอมไพล์ route แรกของแต่ละหน้าตอนถูกเรียก — lifecycle เดินหลายหน้าจึงต้องเผื่อ
  timeout: 180_000,
  expect: { timeout: 15_000 },
  reporter: [['list']],
  globalSetup: './e2e/global-setup.ts',
  globalTeardown: './e2e/global-teardown.ts',
  use: {
    baseURL,
    // default ของ playwright คือ 0 = รอไม่มีที่สิ้นสุด ทำให้ action ที่หา element ไม่เจอค้างเงียบ ๆ
    actionTimeout: 15_000,
    locale: 'th-TH',
    timezoneId: 'Asia/Bangkok',
    trace: 'on-first-retry',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: 'npm run dev',
    url: baseURL,
    // ห้าม reuse — dev server ที่ผู้ใช้เปิดค้างชี้ DB dev ไม่ใช่ seodb_test
    reuseExistingServer: false,
    timeout: 180_000,
    stdout: 'ignore',
    stderr: 'pipe',
    env: {
      PORT: String(PORT),
      DATABASE_URL: process.env.DATABASE_URL ?? '',
      NEXTAUTH_URL: baseURL,
      NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ?? '',
    },
  },
})
