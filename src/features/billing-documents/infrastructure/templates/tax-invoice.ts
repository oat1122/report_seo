import type { RenderData } from '../../application/use-cases/render-data'
import {
  wrapDocument,
  formatCurrency,
  renderCompanyHeader,
  renderCustomerSection,
  renderItemsTable,
  renderNote,
  renderSignatureFooter,
} from './base-template'
import { computeVatBreakdown } from '../../domain/vat'

export function renderTaxInvoice(data: RenderData): string {
  const subtotal = data.items.reduce((sum, i) => sum + i.quantity * i.unitPrice, 0)
  const { vat, grandTotal } = computeVatBreakdown(subtotal)

  const body = `
    ${renderCompanyHeader(data.company, 'ใบกำกับภาษี', data.documentNumber, data.generatedAt)}
    ${renderCustomerSection(data.customer)}
    ${renderItemsTable(data.items)}
    <div class="totals">
      <div class="totals-box">
        <div class="totals-row">
          <span>ราคาก่อน VAT</span>
          <span>${formatCurrency(subtotal)} บาท</span>
        </div>
        <div class="totals-row">
          <span>ภาษีมูลค่าเพิ่ม 7%</span>
          <span>${formatCurrency(vat)} บาท</span>
        </div>
        <div class="totals-row grand-total">
          <span>รวมทั้งสิ้น</span>
          <span>${formatCurrency(grandTotal)} บาท</span>
        </div>
      </div>
    </div>
    ${renderNote(data.note)}
    ${renderSignatureFooter(data.customer.name, data.company.name, data.company.logoUrl)}
  `

  return wrapDocument(body, `ใบกำกับภาษี ${data.documentNumber}`)
}
