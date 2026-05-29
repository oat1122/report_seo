import { readFileSync } from 'fs'
import path from 'path'
import { documentStyles } from './styles'

let fontRegularBase64: string | null = null
let fontBoldBase64: string | null = null

const FONTS_DIR = path.resolve(
  process.cwd(),
  'src/features/billing-documents/infrastructure/templates/fonts',
)

function loadFontBase64(filename: string): string {
  const fontPath = path.join(FONTS_DIR, filename)
  return readFileSync(fontPath).toString('base64')
}

function getFontRegular(): string {
  if (!fontRegularBase64) {
    fontRegularBase64 = loadFontBase64('Sarabun-Regular.ttf')
  }
  return fontRegularBase64
}

function getFontBold(): string {
  if (!fontBoldBase64) {
    fontBoldBase64 = loadFontBase64('Sarabun-Bold.ttf')
  }
  return fontBoldBase64
}

export function wrapDocument(body: string, title: string): string {
  const fontRegular = getFontRegular()
  const fontBold = getFontBold()

  return `<!DOCTYPE html>
<html lang="th">
<head>
  <meta charset="utf-8">
  <title>${escapeHtml(title)}</title>
  <style>
    @font-face {
      font-family: 'Sarabun';
      src: url(data:font/truetype;base64,${fontRegular}) format('truetype');
      font-weight: 400;
      font-style: normal;
    }
    @font-face {
      font-family: 'Sarabun';
      src: url(data:font/truetype;base64,${fontBold}) format('truetype');
      font-weight: 700;
      font-style: normal;
    }
    ${documentStyles}
  </style>
</head>
<body>
  <div class="document">
    ${body}
  </div>
</body>
</html>`
}

export function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

export function formatCurrency(amount: number): string {
  return amount.toLocaleString('th-TH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export interface CompanyData {
  name: string
  address: string
  taxId: string
  phone: string | null
  email: string | null
  logoUrl: string | null
}

export interface CustomerData {
  name: string
  address: string | null
  taxId: string | null
  contactName: string | null
  phone: string | null
}

export interface ItemData {
  description: string
  quantity: number
  unit: string
  unitPrice: number
}

export function resolveLogoSrc(logoUrl: string): string {
  const trimmed = logoUrl.startsWith('/') ? logoUrl.slice(1) : logoUrl
  const absolutePath = path.resolve(process.cwd(), 'public', trimmed)
  try {
    const buf = readFileSync(absolutePath)
    const ext = path.extname(absolutePath).toLowerCase()
    const mime = ext === '.png' ? 'image/png' : 'image/jpeg'
    return `data:${mime};base64,${buf.toString('base64')}`
  } catch {
    return logoUrl
  }
}

export function renderCompanyHeader(
  company: CompanyData,
  docTitle: string,
  docNumber: string,
  docDate: Date,
): string {
  const logoHtml = company.logoUrl
    ? `<img src="${escapeHtml(resolveLogoSrc(company.logoUrl))}" class="company-logo" alt="logo" />`
    : ''

  return `
    <div class="header">
      <div class="header-left">
        ${logoHtml}
        <div class="company-info">
          <h1>${escapeHtml(company.name)}</h1>
          <p>${escapeHtml(company.address)}</p>
          <p>เลขผู้เสียภาษี: ${escapeHtml(company.taxId)}</p>
          ${company.phone ? `<p>โทร: ${escapeHtml(company.phone)}</p>` : ''}
          ${company.email ? `<p>อีเมล: ${escapeHtml(company.email)}</p>` : ''}
        </div>
      </div>
      <div class="document-title">
        <h2>${escapeHtml(docTitle)}</h2>
        <p class="doc-number">เลขที่: ${escapeHtml(docNumber)}</p>
        <p class="doc-date">วันที่: ${formatDate(docDate)}</p>
      </div>
    </div>`
}

export function renderCustomerSection(customer: CustomerData): string {
  return `
    <div class="section">
      <div class="section-title">ข้อมูลลูกค้า</div>
      <div class="customer-info">
        <p class="name">${escapeHtml(customer.name)}</p>
        ${customer.contactName ? `<p>ผู้ติดต่อ: ${escapeHtml(customer.contactName)}</p>` : ''}
        ${customer.phone ? `<p>เบอร์โทร: ${escapeHtml(customer.phone)}</p>` : ''}
        ${customer.address ? `<p>${escapeHtml(customer.address)}</p>` : ''}
        ${customer.taxId ? `<p>เลขผู้เสียภาษี: ${escapeHtml(customer.taxId)}</p>` : ''}
      </div>
    </div>`
}

export function renderItemsTable(items: ItemData[]): string {
  const rows = items
    .map(
      (item, i) => `
      <tr>
        <td>${i + 1}</td>
        <td style="text-align:left">${escapeHtml(item.description)}</td>
        <td>${item.quantity}</td>
        <td>${escapeHtml(item.unit)}</td>
        <td>${formatCurrency(item.unitPrice)}</td>
        <td>${formatCurrency(item.quantity * item.unitPrice)}</td>
      </tr>`,
    )
    .join('')

  return `
    <div class="section">
      <div class="section-title">รายการ</div>
      <table class="items-table">
        <thead>
          <tr>
            <th style="width:40px">#</th>
            <th>รายละเอียด</th>
            <th style="width:60px">จำนวน</th>
            <th style="width:70px">หน่วย</th>
            <th style="width:100px">ราคาต่อหน่วย</th>
            <th style="width:100px">จำนวนเงิน</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </div>`
}

export function renderNote(note: string | null): string {
  if (!note) return ''
  return `
    <div class="note-section">
      <div class="section-title" style="border:none;margin-bottom:4px">หมายเหตุ</div>
      <p>${escapeHtml(note)}</p>
    </div>`
}

export function renderSignatureFooter(): string {
  return `
    <div class="footer">
      <div class="signature-block">
        <div class="signature-line">ผู้รับเงิน</div>
      </div>
      <div class="signature-block">
        <div class="signature-line">ผู้จ่ายเงิน</div>
      </div>
    </div>`
}
