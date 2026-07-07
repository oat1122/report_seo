import { PrismaCustomerProfileRepository } from './infrastructure/PrismaCustomerProfileRepository'
import { PuppeteerPdfRenderer } from '@/infrastructure/pdf/PuppeteerPdfRenderer'
import { getCustomerReportUseCase } from './application/use-cases/getCustomerReport'
import { getCustomerHistoryReportUseCase } from './application/use-cases/getCustomerHistoryReport'
import { exportCustomerReportUseCase } from './application/use-cases/exportCustomerReport'
import { renderReportHtml } from './infrastructure/export/reportPdf'
import { buildReportXlsx } from './infrastructure/export/reportXlsx'

const profileRepo = new PrismaCustomerProfileRepository()
const pdfRenderer = new PuppeteerPdfRenderer()

export const getCustomerReport = getCustomerReportUseCase(profileRepo)
export const getCustomerHistoryReport = getCustomerHistoryReportUseCase()
export const exportCustomerReport = exportCustomerReportUseCase({
  getReport: getCustomerReport,
  renderReportHtml,
  renderToPdf: (html) => pdfRenderer.renderToPdf(html),
  buildXlsx: buildReportXlsx,
})

export type { CustomerReportSnapshot, CustomerHistoryReport } from './domain/CustomerReportSnapshot'
export type { ReportExportFormat } from './application/use-cases/exportCustomerReport'
