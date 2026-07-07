import { z } from 'zod'
import { NextResponse } from 'next/server'
import { withApiHandler, customerAccessGuard } from '@/infrastructure/http'
import { exportCustomerReport } from '@/features/customer-report'

const paramsSchema = z.object({ customerId: z.uuid() })
const querySchema = z.object({ format: z.enum(['pdf', 'xlsx']) })

export const GET = withApiHandler(
  { params: paramsSchema, query: querySchema },
  async ({ params, query }) => {
    await customerAccessGuard({ byUserId: params.customerId }, 'read')

    const { buffer, filename, contentType } = await exportCustomerReport(
      params.customerId,
      query.format,
    )

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    })
  },
)
