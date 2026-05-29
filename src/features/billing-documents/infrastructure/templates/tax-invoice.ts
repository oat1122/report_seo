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

const VAT_RATE = 0.07

export function renderTaxInvoice(data: RenderData): string {
  const subtotal = data.items.reduce((sum, i) => sum + i.quantity * i.unitPrice, 0)
  const vat = subtotal * VAT_RATE
  const grandTotal = subtotal + vat

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
    ${renderSignatureFooter()}
  `

  return wrapDocument(body, `ใบกำกับภาษี ${data.documentNumber}`)
}
