import { withApiHandler, ok } from '@/infrastructure/http'
import { Role } from '@/types/auth'
import { syncAllCustomerMetricsFromAhrefs } from '@/features/metrics'
import { bangkokToday } from '@/lib/date'

export const POST = withApiHandler({ roles: [Role.ADMIN] }, async ({ logger }) => {
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
})
