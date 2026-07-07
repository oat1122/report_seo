import { sarabunFontFaces, escapeHtml } from '@/infrastructure/pdf/html'
import type { CustomerReportSnapshot } from '../../domain/CustomerReportSnapshot'
import type { KeywordReport } from '@/features/keywords'
import type { KeywordRecommend } from '@/features/recommendations'
import { kdLabel, formatThaiDate, formatNumber } from './shared'

// สีอ้างอิงจาก src/theme/theme.ts (rule 08) — PDF ฝัง CSS ตรงจึงใช้ค่า hex ของ token
const reportStyles = `
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html { color-scheme: only light; }
  body { font-family: 'Sarabun', sans-serif; font-size: 12px; color: #2f2f2f; background: #FFFFFF; }
  .header { border-bottom: 2px solid #2f2f2f; padding-bottom: 12px; margin-bottom: 16px; }
  .header h1 { font-size: 20px; }
  .header .meta { color: #64748B; margin-top: 4px; }
  .section { margin-bottom: 18px; }
  .section-title { font-size: 13px; font-weight: 700; border-bottom: 1px solid #E2E8F0;
    padding-bottom: 4px; margin-bottom: 8px; }
  .kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; }
  .kpi { background: #F8F9FA; border: 1px solid #E2E8F0; border-radius: 6px; padding: 8px 10px; }
  .kpi .label { color: #64748B; font-size: 10px; }
  .kpi .value { font-size: 16px; font-weight: 700; margin-top: 2px; }
  table { width: 100%; border-collapse: collapse; }
  th, td { border: 1px solid #E2E8F0; padding: 5px 8px; text-align: center; }
  th { background: #F8F9FA; font-weight: 700; }
  td.left { text-align: left; }
  .empty { color: #64748B; padding: 8px 0; }
  .footer { margin-top: 24px; color: #64748B; font-size: 10px; text-align: right; }
`

function renderKpiGrid(metrics: NonNullable<CustomerReportSnapshot['metrics']>): string {
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

  const cells = items
    .map(
      ([label, value]) => `
      <div class="kpi">
        <div class="label">${escapeHtml(label)}</div>
        <div class="value">${escapeHtml(value)}</div>
      </div>`,
    )
    .join('')

  return `<div class="kpi-grid">${cells}</div>`
}

function renderKeywordTable(keywords: KeywordReport[]): string {
  if (keywords.length === 0) return '<p class="empty">ยังไม่มีข้อมูล</p>'

  const rows = keywords
    .map(
      (kw) => `
      <tr>
        <td class="left">${escapeHtml(kw.keyword)}</td>
        <td>${kw.position ?? '-'}</td>
        <td>${formatNumber(kw.traffic)}</td>
        <td>${escapeHtml(kdLabel(kw.kd))}</td>
      </tr>`,
    )
    .join('')

  return `
    <table>
      <thead>
        <tr>
          <th style="text-align:left">Keyword</th>
          <th style="width:70px">อันดับ</th>
          <th style="width:80px">Traffic</th>
          <th style="width:90px">ความยาก (KD)</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>`
}

function renderRecommendationTable(recommendations: KeywordRecommend[]): string {
  if (recommendations.length === 0) return '<p class="empty">ยังไม่มีข้อมูล</p>'

  const rows = recommendations
    .map(
      (rec) => `
      <tr>
        <td class="left">${escapeHtml(rec.keyword)}</td>
        <td>${escapeHtml(kdLabel(rec.kd))}</td>
        <td class="left">${escapeHtml(rec.note ?? '-')}</td>
      </tr>`,
    )
    .join('')

  return `
    <table>
      <thead>
        <tr>
          <th style="text-align:left">Keyword</th>
          <th style="width:90px">ความยาก (KD)</th>
          <th style="text-align:left">หมายเหตุ</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>`
}

export function renderReportHtml(snapshot: CustomerReportSnapshot, generatedAt: Date): string {
  const title = snapshot.domain ? `รายงาน SEO — ${snapshot.domain}` : 'รายงาน SEO'
  const metaLine = [snapshot.customerName, snapshot.domain].filter(Boolean).join(' • ')

  return `<!DOCTYPE html>
<html lang="th">
<head>
  <meta charset="utf-8">
  <title>${escapeHtml(title)}</title>
  <style>
    ${sarabunFontFaces()}
    ${reportStyles}
  </style>
</head>
<body>
  <div class="header">
    <h1>รายงาน SEO</h1>
    <p class="meta">${escapeHtml(metaLine || '-')}</p>
    <p class="meta">วันที่ออกรายงาน: ${formatThaiDate(generatedAt)}</p>
  </div>

  <div class="section">
    <div class="section-title">ภาพรวมโดเมน</div>
    ${snapshot.metrics ? renderKpiGrid(snapshot.metrics) : '<p class="empty">ยังไม่มีข้อมูล</p>'}
  </div>

  <div class="section">
    <div class="section-title">Keyword หลัก (Top Report)</div>
    ${renderKeywordTable(snapshot.topKeywords)}
  </div>

  <div class="section">
    <div class="section-title">Keyword อื่น ๆ</div>
    ${renderKeywordTable(snapshot.otherKeywords)}
  </div>

  <div class="section">
    <div class="section-title">Keyword ที่แนะนำ</div>
    ${renderRecommendationTable(snapshot.recommendations)}
  </div>

  <div class="footer">สร้างอัตโนมัติจากระบบรายงาน SEO</div>
</body>
</html>`
}
