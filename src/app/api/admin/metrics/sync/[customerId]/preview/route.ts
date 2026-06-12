import { z } from 'zod'
import { withApiHandler, customerAccessGuard, ok } from '@/infrastructure/http'
import { previewCustomerAhrefsMetrics } from '@/features/metrics'
import { bangkokToday } from '@/lib/date'

// customerId ในพาธ = userId ของลูกค้า (ตรงกับคอนเวนชัน /api/customers/[customerId]/metrics)
const paramsSchema = z.object({ customerId: z.uuid() })

// ดึงค่าจาก Ahrefs มาแสดง preview เท่านั้น — ไม่เขียน DB (บันทึกผ่าน POST /customers/[id]/metrics)
export const GET = withApiHandler({ params: paramsSchema }, async ({ params }) => {
  await customerAccessGuard({ byUserId: params.customerId }, 'manage')
  return ok(await previewCustomerAhrefsMetrics(params.customerId, bangkokToday()))
})
