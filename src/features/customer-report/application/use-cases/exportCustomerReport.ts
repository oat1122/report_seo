import type { CustomerReportSnapshot } from '../../domain/CustomerReportSnapshot'

export type ReportExportFormat = 'pdf' | 'xlsx'

export interface ExportedReportFile {
  buffer: Buffer
  filename: string
  contentType: string
}

interface ExportCustomerReportDeps {
  getReport: (customerUserId: string) => Promise<CustomerReportSnapshot>
  renderReportHtml: (snapshot: CustomerReportSnapshot, generatedAt: Date) => string
  renderToPdf: (html: string) => Promise<Buffer>
  buildXlsx: (snapshot: CustomerReportSnapshot, generatedAt: Date) => Buffer
}

export function exportCustomerReportUseCase(deps: ExportCustomerReportDeps) {
  return async (
    customerUserId: string,
    format: ReportExportFormat,
  ): Promise<ExportedReportFile> => {
    const snapshot = await deps.getReport(customerUserId)
    const generatedAt = new Date()

    // Content-Disposition รองรับเฉพาะ ASCII — ใช้โดเมน (sanitize) แทนชื่อลูกค้าภาษาไทย
    const domainPart = (snapshot.domain ?? '').replace(/[^a-zA-Z0-9.-]/g, '') || 'report'
    const datePart = generatedAt.toISOString().slice(0, 10).replace(/-/g, '')
    const filename = `seo-report-${domainPart}-${datePart}.${format}`

    if (format === 'pdf') {
      const html = deps.renderReportHtml(snapshot, generatedAt)
      return {
        buffer: await deps.renderToPdf(html),
        filename,
        contentType: 'application/pdf',
      }
    }

    return {
      buffer: deps.buildXlsx(snapshot, generatedAt),
      filename,
      contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    }
  }
}
