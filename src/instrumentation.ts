// Next.js startup hook — รันครั้งเดียวตอน server boot (ทั้ง `next dev`, `next start`, และ
// custom server `node server.js`). ใช้ลง node-cron สำหรับ sync Ahrefs รายสัปดาห์
// อยู่ใน Next bundle จึง resolve alias `@/` และเรียก use case ได้ตรง ไม่ต้องผ่าน HTTP/auth
export async function register() {
  // cron ต้องรันบน Node runtime เท่านั้น (ไม่ใช่ edge) และไม่รันซ้ำในแต่ละ request
  if (process.env.NEXT_RUNTIME !== 'nodejs') return
  // arm เฉพาะ production หรือเมื่อเปิด flag — กัน dev ยิง Ahrefs โดยไม่ตั้งใจ
  if (process.env.NODE_ENV !== 'production' && process.env.ENABLE_AHREFS_CRON !== '1') return

  const cron = (await import('node-cron')).default
  const { syncAllCustomerMetricsFromAhrefs } = await import('@/features/metrics')
  const { bangkokToday } = await import('@/lib/date')
  const { logger } = await import('@/lib/logger')

  // '0 6 * * 1' = ทุกวันจันทร์ 06:00 (โซนเวลา Asia/Bangkok)
  cron.schedule(
    '0 6 * * 1',
    async () => {
      try {
        const summary = await syncAllCustomerMetricsFromAhrefs(bangkokToday())
        logger.info(
          {
            total: summary.total,
            updated: summary.updated,
            skipped: summary.skipped,
            errors: summary.errors,
          },
          'weekly ahrefs sync complete',
        )
      } catch (err) {
        logger.error({ err }, 'weekly ahrefs sync failed')
      }
    },
    { timezone: 'Asia/Bangkok', noOverlap: true },
  )

  logger.info('weekly ahrefs cron registered (Mon 06:00 Asia/Bangkok)')
}
