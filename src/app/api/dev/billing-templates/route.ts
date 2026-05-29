import { NextResponse } from 'next/server'
import { z } from 'zod'
import { previewTemplate } from '@/features/billing-documents'

const querySchema = z.object({
  type: z
    .enum(['BILLING_NOTE', 'INVOICE', 'RECEIPT', 'TAX_INVOICE'])
    .default('INVOICE'),
  vat: z.enum(['true', 'false']).optional(),
  format: z.enum(['html', 'pdf']).optional(),
})

export async function GET(req: Request) {
  if (process.env.NODE_ENV === 'production') {
    return new NextResponse('Not found', { status: 404 })
  }

  const query = querySchema.parse(Object.fromEntries(new URL(req.url).searchParams))
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
}
