import { withApiHandler, ok } from '@/infrastructure/http'
import { Role } from '@/types/auth'
import { syncAllCustomerMetricsFromAhrefs, ahrefsSyncPinSchema } from '@/features/metrics'
import { bangkokToday } from '@/lib/date'
import { ForbiddenError } from '@/lib/errors'

export const POST = withApiHandler(
  { roles: [Role.ADMIN], body: ahrefsSyncPinSchema },
  async ({ body, logger }) => {
    const configuredPin = process.env.PIN_Ahrefs_SYNC
    if (!configuredPin) throw new Error('PIN_Ahrefs_SYNC is not set')
    if (body.pin !== configuredPin) throw new ForbiddenError('PIN ไม่ถูกต้อง')

    const summary = await syncAllCustomerMetricsFromAhrefs(bangkokToday())
    logger.info(
      {
        total: summary.total,
        updated: summary.updated,
        skipped: summary.skipped,
        errors: summary.errors,
      },
      'ahrefs batch sync complete',
    )
    return ok(summary)
  },
)
