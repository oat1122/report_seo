'use client'

import { useState } from 'react'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import {
  DOCUMENT_TYPE_LABELS,
  type BillingDocumentType,
} from '@/features/billing-documents/domain/DocumentType'

const TYPES: BillingDocumentType[] = ['BILLING_NOTE', 'INVOICE', 'RECEIPT', 'TAX_INVOICE']

function buildUrl(type: BillingDocumentType, vat: boolean, format?: 'pdf') {
  const params = new URLSearchParams({ type, vat: String(vat) })
  if (format) params.set('format', format)
  return `/api/dev/billing-templates?${params.toString()}`
}

export function TemplatePreview() {
  const [type, setType] = useState<BillingDocumentType>('INVOICE')
  const [vat, setVat] = useState(false)

  const htmlUrl = buildUrl(type, vat)
  const pdfUrl = buildUrl(type, vat, 'pdf')

  return (
    <div className="flex h-screen flex-col gap-4 p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-foreground">ทดสอบ Render เอกสาร (Dev)</h1>
          <p className="text-sm text-muted-foreground">
            พรีวิวเทมเพลต PDF จาก infrastructure/templates ด้วยข้อมูลตัวอย่าง
          </p>
        </div>
        <Button asChild variant="outline">
          <a href={pdfUrl} target="_blank" rel="noreferrer">
            เปิดเป็น PDF
          </a>
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-6">
        <Tabs value={type} onValueChange={(value) => setType(value as BillingDocumentType)}>
          <TabsList>
            {TYPES.map((documentType) => (
              <TabsTrigger key={documentType} value={documentType}>
                {DOCUMENT_TYPE_LABELS[documentType]}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {type === 'INVOICE' && (
          <div className="flex items-center gap-2">
            <Switch id="include-vat" checked={vat} onCheckedChange={setVat} />
            <Label htmlFor="include-vat">รวม VAT 7%</Label>
          </div>
        )}
      </div>

      <div className="min-h-0 flex-1 overflow-auto rounded-md border border-border bg-muted p-6">
        <iframe
          key={htmlUrl}
          src={htmlUrl}
          title="template-preview"
          className="mx-auto block border border-border bg-background shadow-sm"
          style={{ width: '210mm', height: '297mm' }}
        />
      </div>
    </div>
  )
}
