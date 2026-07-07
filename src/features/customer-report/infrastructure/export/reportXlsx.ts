import * as XLSX from 'xlsx'
import type { CustomerReportSnapshot } from '../../domain/CustomerReportSnapshot'
import type { KeywordReport } from '@/features/keywords'
import { kdLabel, formatThaiDate } from './shared'

type SheetRow = Array<string | number>

function keywordRows(keywords: KeywordReport[]): SheetRow[] {
  return keywords.map((kw) => [
    kw.keyword,
    kw.position ?? '-',
    kw.traffic,
    kdLabel(kw.kd),
    kw.dateRecorded.toISOString().slice(0, 10),
  ])
}

function appendSheet(wb: XLSX.WorkBook, name: string, rows: SheetRow[], colWidths: number[]) {
  const sheet = XLSX.utils.aoa_to_sheet(rows)
  sheet['!cols'] = colWidths.map((wch) => ({ wch }))
  XLSX.utils.book_append_sheet(wb, sheet, name)
}

export function buildReportXlsx(snapshot: CustomerReportSnapshot, generatedAt: Date): Buffer {
  const wb = XLSX.utils.book_new()

  const metricsRows: SheetRow[] = [
    ['รายการ', 'ค่า'],
    ['ลูกค้า', snapshot.customerName ?? '-'],
    ['โดเมน', snapshot.domain ?? '-'],
    ['วันที่ออกรายงาน', formatThaiDate(generatedAt)],
  ]
  if (snapshot.metrics) {
    metricsRows.push(
      ['Domain Rating', snapshot.metrics.domainRating],
      ['Health Score', snapshot.metrics.healthScore],
      ['Spam Score', snapshot.metrics.spamScore],
      ['อายุโดเมน', `${snapshot.metrics.ageInYears} ปี ${snapshot.metrics.ageInMonths} เดือน`],
      ['Organic Traffic', snapshot.metrics.organicTraffic],
      ['Organic Keywords', snapshot.metrics.organicKeywords],
      ['Backlinks', snapshot.metrics.backlinks],
      ['Ref. Domains', snapshot.metrics.refDomains],
    )
  } else {
    metricsRows.push(['Metrics', 'ยังไม่มีข้อมูล'])
  }
  appendSheet(wb, 'Overall Metrics', metricsRows, [24, 32])

  const keywordSheetRows: SheetRow[] = [
    ['Keyword', 'อันดับ', 'Traffic', 'ความยาก (KD)', 'วันที่บันทึก'],
    ...keywordRows(snapshot.topKeywords),
    ...keywordRows(snapshot.otherKeywords),
  ]
  appendSheet(wb, 'Keywords', keywordSheetRows, [36, 8, 10, 14, 14])

  const recommendationRows: SheetRow[] = [
    ['Keyword', 'ความยาก (KD)', 'หมายเหตุ', 'วันที่แนะนำ'],
    ...snapshot.recommendations.map((rec) => [
      rec.keyword,
      kdLabel(rec.kd),
      rec.note ?? '-',
      rec.createdAt.toISOString().slice(0, 10),
    ]),
  ]
  appendSheet(wb, 'Recommendations', recommendationRows, [36, 14, 40, 14])

  return XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' }) as Buffer
}
