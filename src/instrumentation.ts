// Next.js startup hook — รันครั้งเดียวตอน server boot (ทั้ง `next dev`, `next start`, และ
// custom server `node server.js`). ใช้ลง node-cron สำหรับ "เสนอ" ค่า Ahrefs รายสัปดาห์
// อยู่ใน Next bundle จึง resolve alias `@/` และเรียก use case ได้ตรง ไม่ต้องผ่าน HTTP/auth
export async function register() {
  // cron ต้องรันบน Node runtime เท่านั้น (ไม่ใช่ edge) และไม่รันซ้ำในแต่ละ request
  if (process.env.NEXT_RUNTIME !== 'nodejs') return
  // arm เฉพาะ production หรือเมื่อเปิด flag — กัน dev ยิง Ahrefs โดยไม่ตั้งใจ
  if (process.env.NODE_ENV !== 'production' && process.env.ENABLE_AHREFS_CRON !== '1') return

  const cron = (await import('node-cron')).default
  const { computeAhrefsProposals } = await import('@/features/metrics')
  const { createNotification, NOTIFICATION_TYPES } = await import('@/features/notifications')
  const { listUserIdsByRole } = await import('@/features/users')
  const { bangkokToday } = await import('@/lib/date')
  const { logger } = await import('@/lib/logger')

  // '0 6 * * 1' = ทุกวันจันทร์ 06:00 (โซนเวลา Asia/Bangkok)
  // cron ไม่เขียน DB — สร้าง notification ข้อเสนอให้ทีมงานรีวิว/บันทึกเองผ่าน dialog
  cron.schedule(
    '0 6 * * 1',
    async () => {
      try {
        const date = bangkokToday()
        const proposals = await computeAhrefsProposals(date)
        const adminIds = await listUserIdsByRole('ADMIN')

        let sent = 0
        for (const p of proposals) {
          const recipients = [...new Set([...adminIds, p.seoDevUserId])].filter(
            (id): id is string => Boolean(id),
          )
          if (recipients.length === 0) continue

          await createNotification({
            type: NOTIFICATION_TYPES.AHREFS_METRICS_PROPOSED,
            recipientUserIds: recipients,
            title: `เสนออัปเดตค่า Ahrefs — ${p.customerName}`,
            body: `${p.domain} — ตรวจสอบและบันทึกค่าที่ดึงจาก Ahrefs`,
            metadata: {
              kind: 'ahrefs-metrics-proposal',
              customerUserId: p.customerUserId,
              customerName: p.customerName,
              domain: p.domain,
              proposed: p.proposed,
              fetchedAt: date,
            },
          })
          sent++
        }

        logger.info({ proposed: proposals.length, sent }, 'weekly ahrefs proposal notifications sent')
      } catch (err) {
        logger.error({ err }, 'weekly ahrefs proposal failed')
      }
    },
    { timezone: 'Asia/Bangkok', noOverlap: true },
  )

  logger.info('weekly ahrefs proposal cron registered (Mon 06:00 Asia/Bangkok)')
}
