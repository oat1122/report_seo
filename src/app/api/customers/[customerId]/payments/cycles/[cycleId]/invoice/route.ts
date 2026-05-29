import { z } from 'zod'
import { NextResponse } from 'next/server'
import { withApiHandler, customerAccessGuard } from '@/infrastructure/http'
import { generateCycleInvoicePdf } from '@/features/billing-documents'

const paramsSchema = z.object({
  customerId: z.string().uuid(),
  cycleId: z.string().uuid(),
})

const querySchema = z.object({
  vat: z.enum(['true', 'false']).optional(),
})

export const GET = withApiHandler(
  { params: paramsSchema, query: querySchema },
  async ({ params, query }) => {
    const ctx = await customerAccessGuard({ byUserId: params.customerId }, 'read')

    const { buffer, filename } = await generateCycleInvoicePdf({
      customerId: ctx.customer.id,
      cycleId: params.cycleId,
      includeVat: query.vat === 'true',
    })

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    })
  },
)
