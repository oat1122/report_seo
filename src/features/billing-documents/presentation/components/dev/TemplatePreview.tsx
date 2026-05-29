'use client'

import { useEffect, useRef, useState } from 'react'
import { Copy, FileCode2, Eye } from 'lucide-react'
import { toast } from 'sonner'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import {
  DOCUMENT_TYPE_LABELS,
  type BillingDocumentType,
} from '@/features/billing-documents/domain/DocumentType'

const TYPES: BillingDocumentType[] = ['BILLING_NOTE', 'INVOICE', 'RECEIPT', 'TAX_INVOICE']

type ViewMode = 'preview' | 'html'

// ขนาด A4 ที่ 96dpi: กว้าง 210mm, สูง 297mm = 1123px — ใช้เป็น "หนึ่งหน้ากระดาษ"
const A4_PAGE_HEIGHT_PX = 1123

function buildUrl(type: BillingDocumentType, vat: boolean, format?: 'pdf') {
  const params = new URLSearchParams({ type, vat: String(vat) })
  if (format) params.set('format', format)
  return `/api/dev/billing-templates?${params.toString()}`
}

export function TemplatePreview() {
  const [type, setType] = useState<BillingDocumentType>('INVOICE')
  const [vat, setVat] = useState(false)
  const [viewMode, setViewMode] = useState<ViewMode>('preview')
  const [pageCount, setPageCount] = useState(1)
  const [htmlSource, setHtmlSource] = useState('')
  const frameRef = useRef<HTMLIFrameElement>(null)

  const htmlUrl = buildUrl(type, vat)
  const pdfUrl = buildUrl(type, vat, 'pdf')

  // iframe กว้างเท่า A4 — วัดความสูงจริงของเอกสาร (same-origin จาก /api/dev) แล้ว
  // ปัดขึ้นเป็นจำนวนเต็มของหน้า A4 เพื่อให้กรอบเป็นกระดาษเต็มหน้าเสมอ และเห็นว่าล้นไปหน้าใหม่กี่หน้า
  const fitPagesToContent = () => {
    const doc = frameRef.current?.contentDocument
    if (!doc) return
    const contentHeight = doc.documentElement.scrollHeight
    setPageCount(Math.max(1, Math.ceil(contentHeight / A4_PAGE_HEIGHT_PX)))
  }

  // โหมด HTML: ดึง source ดิบมาแสดง/คัดลอก
  useEffect(() => {
    if (viewMode !== 'html') return
    let cancelled = false
    fetch(htmlUrl)
      .then((res) => res.text())
      .then((text) => {
        if (!cancelled) setHtmlSource(text)
      })
      .catch(() => {
        if (!cancelled) setHtmlSource('')
      })
    return () => {
      cancelled = true
    }
  }, [viewMode, htmlUrl])

  const copyHtml = async () => {
    try {
      const source = htmlSource || (await fetch(htmlUrl).then((res) => res.text()))
      await navigator.clipboard.writeText(source)
      toast.success('คัดลอก HTML แล้ว')
    } catch {
      toast.error('คัดลอก HTML ไม่สำเร็จ')
    }
  }

  const frameHeight = pageCount * A4_PAGE_HEIGHT_PX
  const pageBreaks = Array.from({ length: pageCount - 1 }, (_, i) => i + 1)

  return (
    <div className="flex h-screen flex-col gap-4 p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-foreground">ทดสอบ Render เอกสาร (Dev)</h1>
          <p className="text-sm text-muted-foreground">
            พรีวิวเทมเพลต PDF จาก infrastructure/templates ด้วยข้อมูลตัวอย่าง
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={copyHtml}>
            <Copy className="size-4" />
            คัดลอก HTML
          </Button>
          <Button asChild variant="outline">
            <a href={pdfUrl} target="_blank" rel="noreferrer">
              เปิดเป็น PDF
            </a>
          </Button>
        </div>
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

        <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as ViewMode)}>
          <TabsList>
            <TabsTrigger value="preview">
              <Eye className="size-4" />
              ตัวอย่าง
            </TabsTrigger>
            <TabsTrigger value="html">
              <FileCode2 className="size-4" />
              โค้ด HTML
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {type === 'INVOICE' && (
          <div className="flex items-center gap-2">
            <Switch id="include-vat" checked={vat} onCheckedChange={setVat} />
            <Label htmlFor="include-vat">รวม VAT 7%</Label>
          </div>
        )}
      </div>

      {viewMode === 'preview' ? (
        <div className="min-h-0 flex-1 overflow-auto rounded-md border border-border bg-muted p-6">
          <div className="relative mx-auto" style={{ width: '210mm' }}>
            <iframe
              key={htmlUrl}
              ref={frameRef}
              src={htmlUrl}
              title="template-preview"
              onLoad={fitPagesToContent}
              className="block border border-border bg-background shadow-sm"
              style={{ width: '210mm', height: `${frameHeight}px` }}
            />
            {pageBreaks.map((page) => (
              <div
                key={page}
                className="pointer-events-none absolute inset-x-0 border-t border-dashed border-muted-foreground/50"
                style={{ top: `${page * A4_PAGE_HEIGHT_PX}px` }}
              >
                <span className="absolute -top-3 right-2 rounded bg-muted px-2 text-xs text-muted-foreground">
                  หน้า {page + 1}
                </span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <pre className="min-h-0 flex-1 overflow-auto rounded-md border border-border bg-muted p-4 text-xs text-foreground">
          <code>{htmlSource}</code>
        </pre>
      )}
    </div>
  )
}
