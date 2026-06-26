import { NextResponse } from 'next/server'
import { z } from 'zod'
import { withApiHandler } from '@/infrastructure/http'
import { previewTemplate } from '@/features/billing-documents'
import { Role } from '@/types/auth'

const querySchema = z.object({
  type: z.enum(['BILLING_NOTE', 'INVOICE', 'RECEIPT', 'TAX_INVOICE']).default('INVOICE'),
  vat: z.enum(['true', 'false']).optional(),
  format: z.enum(['html', 'pdf']).optional(),
})

// dev-only preview tool — gate ที่ ADMIN ด้วย (อย่าพึ่ง NODE_ENV อย่างเดียว เผื่อ env ตั้งผิด)
export const GET = withApiHandler(
  { roles: [Role.ADMIN], query: querySchema },
  async ({ query }) => {
    if (process.env.NODE_ENV === 'production') {
      return new NextResponse('Not found', { status: 404 })
    }

    const result = await previewTemplate({
      type: query.type,
      includeVat: query.vat === 'true',
      format: query.format ?? 'html',
    })

    if (result.format === 'pdf') {
      return new NextResponse(new Uint8Array(result.pdf), {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `inline; filename="${result.filename}"`,
        },
      })
    }

    return new NextResponse(result.html, {
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    })
  },
)
