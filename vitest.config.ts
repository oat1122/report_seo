import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [react()],
  resolve: {
    tsconfigPaths: true,
  },
  test: {
    // ค่า default เป็น node — เทสต์ฝั่ง UI opt-in ด้วย docblock `// @vitest-environment jsdom`
    // ต่อไฟล์ เพื่อไม่ให้เทสต์ backend ต้องจ่ายค่าบูต DOM ไปด้วย
    environment: 'node',
    include: ['src/**/__tests__/**/*.test.{ts,tsx}', 'src/**/*.test.{ts,tsx}'],
    exclude: ['node_modules', '.next'],
    setupFiles: ['./vitest.setup.ts'],
    globals: false,
  },
})
