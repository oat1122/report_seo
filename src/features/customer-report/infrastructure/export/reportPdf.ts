import { readFileSync } from 'fs'
import path from 'path'
import PdfPrinter from 'pdfmake'
import type {
  Content,
  CustomTableLayout,
  TableCell,
  TDocumentDefinitions,
} from 'pdfmake/interfaces'
import type { CustomerReportSnapshot } from '../../domain/CustomerReportSnapshot'
import type { KeywordReport } from '@/features/keywords'
import type { KeywordRecommend } from '@/features/recommendations'
import { kdLabel, formatThaiDate, formatNumber } from './shared'

// pure-JS PDF (pdfmake/pdfkit) — prod เป็น shared host ที่รัน Chromium/puppeteer ไม่ได้
// สีอ้างอิงจาก src/theme/theme.ts (rule 08)
const TEXT = '#2f2f2f'
const MUTED = '#64748B'
const BORDER = '#E2E8F0'
const PANEL = '#F8F9FA'

const FONTS_DIR = path.resolve(process.cwd(), 'src/infrastructure/pdf/fonts')
const LOGO_PATH = path.resolve(process.cwd(), 'public/img/LOGO_SEO_PRIME4_0-removebg.png')

// logo หายไม่ควรทำให้ export ทั้งใบพัง — แค่ตัด logo ออก
function loadLogoDataUrl(): string | null {
  try {
    return `data:image/png;base64,${readFileSync(LOGO_PATH).toString('base64')}`
  } catch {
    return null
  }
}

const printer = new PdfPrinter({
  Sarabun: {
    normal: path.join(FONTS_DIR, 'Sarabun-Regular.ttf'),
    bold: path.join(FONTS_DIR, 'Sarabun-Bold.ttf'),
    italics: path.join(FONTS_DIR, 'Sarabun-Regular.ttf'),
    bolditalics: path.join(FONTS_DIR, 'Sarabun-Bold.ttf'),
  },
})

const lightBorders: CustomTableLayout = {
  hLineColor: () => BORDER,
  vLineColor: () => BORDER,
  hLineWidth: () => 0.75,
  vLineWidth: () => 0.75,
  paddingTop: () => 4,
  paddingBottom: () => 4,
  paddingLeft: () => 6,
  paddingRight: () => 6,
}

const sectionTitle = (text: string): Content => ({
  text,
  bold: true,
  fontSize: 11,
  margin: [0, 12, 0, 6],
})

// pdfmake mutate content object ตอน layout — ห้าม reuse instance เดียวข้ามหลาย section
const emptyNote = (): Content => ({ text: 'ยังไม่มีข้อมูล', color: MUTED })

const headerCell = (text: string, alignment: 'left' | 'center' = 'center'): TableCell => ({
  text,
  bold: true,
  fillColor: PANEL,
  alignment,
})

function kpiGrid(metrics: NonNullable<CustomerReportSnapshot['metrics']>): Content {
  const items: Array<[string, string]> = [
    ['Domain Rating', formatNumber(metrics.domainRating)],
    ['Health Score', formatNumber(metrics.healthScore)],
    ['Spam Score', formatNumber(metrics.spamScore)],
    ['อายุโดเมน', `${metrics.ageInYears} ปี ${metrics.ageInMonths} เดือน`],
    ['Organic Traffic', formatNumber(metrics.organicTraffic)],
    ['Organic Keywords', formatNumber(metrics.organicKeywords)],
    ['Backlinks', formatNumber(metrics.backlinks)],
    ['Ref. Domains', formatNumber(metrics.refDomains)],
  ]

  const cells: TableCell[] = items.map(([label, value]) => ({
    stack: [
      { text: label, fontSize: 8, color: MUTED },
      { text: value, fontSize: 12, bold: true, margin: [0, 2, 0, 0] },
    ],
    fillColor: PANEL,
  }))

  return {
    table: {
      widths: ['*', '*', '*', '*'],
      body: [cells.slice(0, 4), cells.slice(4)],
    },
    layout: lightBorders,
  }
}

function keywordTable(keywords: KeywordReport[]): Content {
  if (keywords.length === 0) return emptyNote()

  const rows: TableCell[][] = keywords.map((kw) => [
    { text: kw.keyword },
    { text: kw.position ?? '-', alignment: 'center' },
    { text: formatNumber(kw.traffic), alignment: 'center' },
    { text: kdLabel(kw.kd), alignment: 'center' },
  ])

  return {
    table: {
      headerRows: 1,
      widths: ['*', 55, 70, 85],
      body: [
        [
          headerCell('Keyword', 'left'),
          headerCell('อันดับ'),
          headerCell('Traffic'),
          headerCell('ความยาก (KD)'),
        ],
        ...rows,
      ],
    },
    layout: lightBorders,
  }
}

function recommendationTable(recommendations: KeywordRecommend[]): Content {
  if (recommendations.length === 0) return emptyNote()

  const rows: TableCell[][] = recommendations.map((rec) => [
    { text: rec.keyword },
    { text: kdLabel(rec.kd), alignment: 'center' },
    { text: rec.note ?? '-' },
  ])

  return {
    table: {
      headerRows: 1,
      widths: ['*', 85, '*'],
      body: [
        [headerCell('Keyword', 'left'), headerCell('ความยาก (KD)'), headerCell('หมายเหตุ', 'left')],
        ...rows,
      ],
    },
    layout: lightBorders,
  }
}

function buildDocDefinition(
  snapshot: CustomerReportSnapshot,
  generatedAt: Date,
): TDocumentDefinitions {
  const metaLine = [snapshot.customerName, snapshot.domain].filter(Boolean).join(' • ')
  const logo = loadLogoDataUrl()

  return {
    pageSize: 'A4',
    pageMargins: [40, 42, 40, 46],
    defaultStyle: { font: 'Sarabun', fontSize: 9, color: TEXT },
    content: [
      {
        columns: [
          {
            width: '*',
            stack: [
              { text: 'รายงาน SEO', fontSize: 18, bold: true },
              { text: metaLine || '-', color: MUTED, margin: [0, 2, 0, 0] },
              {
                text: `วันที่ออกรายงาน: ${formatThaiDate(generatedAt)}`,
                color: MUTED,
                margin: [0, 2, 0, 0],
              },
            ],
          },
          ...(logo ? [{ image: logo, fit: [64, 64] as [number, number], width: 70 }] : []),
        ],
      },
      {
        canvas: [{ type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 1.2, lineColor: TEXT }],
        margin: [0, 8, 0, 2],
      },
      sectionTitle('ภาพรวมโดเมน'),
      snapshot.metrics ? kpiGrid(snapshot.metrics) : emptyNote(),
      sectionTitle('Keyword'),
      keywordTable([...snapshot.topKeywords, ...snapshot.otherKeywords]),
      sectionTitle('Keyword ที่แนะนำ'),
      recommendationTable(snapshot.recommendations),
      {
        text: 'สร้างอัตโนมัติจากระบบรายงาน SEO',
        color: MUTED,
        fontSize: 8,
        alignment: 'right',
        margin: [0, 18, 0, 0],
      },
    ],
  }
}

export function buildReportPdf(
  snapshot: CustomerReportSnapshot,
  generatedAt: Date,
): Promise<Buffer> {
  const doc = printer.createPdfKitDocument(buildDocDefinition(snapshot, generatedAt))

  return new Promise<Buffer>((resolve, reject) => {
    const chunks: Buffer[] = []
    doc.on('data', (chunk: Buffer) => chunks.push(chunk))
    doc.on('end', () => resolve(Buffer.concat(chunks)))
    doc.on('error', reject)
    doc.end()
  })
}
