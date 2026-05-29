import type { RenderData } from '../../application/use-cases/render-data'
import {
  wrapDocument,
  formatCurrency,
  formatDate,
  escapeHtml,
  resolveLogoSrc,
  renderItemDetail,
  renderSignatureFooter,
} from './base-template'
import { computeVatBreakdown } from '../../domain/vat'
import { formatAmountInWords } from './amount-in-words'

export function renderInvoice(data: RenderData): string {
  const subtotal = data.items.reduce((sum, i) => sum + i.quantity * i.unitPrice, 0)
  const grandTotal = data.includeVat ? computeVatBreakdown(subtotal).grandTotal : subtotal

  const totalsHtml = data.includeVat
    ? (() => {
        const { vat, grandTotal } = computeVatBreakdown(subtotal)
        return `
          <div class="new-totals-box">
            <div class="new-subtotal-row">
              <span>Subtotal</span>
              <span>${formatCurrency(subtotal)}</span>
            </div>
            <div class="new-subtotal-row">
              <span>VAT 7%</span>
              <span>${formatCurrency(vat)}</span>
            </div>
            <div class="new-grand-total">
              <span class="label">Grand Total</span>
              <span class="value">${formatCurrency(grandTotal)}</span>
            </div>
          </div>`
      })()
    : `
          <div class="new-grand-total">
            <span class="label">Grand Total</span>
            <span class="value">${formatCurrency(subtotal)}</span>
          </div>`

  const logoHtml = data.company.logoUrl
    ? `<img src="${escapeHtml(resolveLogoSrc(data.company.logoUrl))}" class="new-logo" alt="logo" />`
    : `<h2 class="new-company-name">${escapeHtml(data.company.name)}</h2>`

  const rowsHtml = data.items
    .map(
      (item, i) => `
    <tr>
      <td class="text-center">${i + 1}</td>
      <td class="text-left">
        <div class="item-desc-title">${escapeHtml(item.description)}</div>
        ${renderItemDetail(item.detail)}
      </td>
      <td class="text-center">${item.quantity}</td>
      <td class="text-center">${escapeHtml(item.unit)}</td>
      <td class="text-right" style="padding-right: 20px;">${formatCurrency(item.unitPrice)}</td>
      <td class="text-right" style="padding-right: 20px;">${formatCurrency(item.quantity * item.unitPrice)}</td>
    </tr>
  `,
    )
    .join('')

  const addressLine = [data.customer.address].filter(Boolean).join(' ')

  const body = `
    <div class="new-invoice-container">
      <div class="new-header-section">
        <div class="new-header-left">
          <h1>INVOICE</h1>
          <p>No. ${escapeHtml(data.documentNumber)}</p>
          <p>Date. ${formatDate(data.generatedAt)}</p>
          ${data.dueDate ? `<p>Due Date. ${formatDate(data.dueDate)}</p>` : ''}
        </div>
        <div class="new-header-right">
          ${logoHtml}
        </div>
      </div>

      <div class="new-info-section">
        <div class="new-bill-to">
          <h3>Bill to.</h3>
          <table class="new-info-table">
            <tr>
              
              <td class="value">${escapeHtml(data.customer.name)}</td>
            </tr>
            
            <tr>
              
              <td class="value">${escapeHtml(data.customer.email || '-')}</td>
            </tr>
            <tr>
              
              <td class="value">${escapeHtml(addressLine || '-')}</td>
            </tr>
            <tr>
              
              <td class="value-small">Tel: ${escapeHtml(data.customer.phone || '-')}</td>
            </tr>
            ${
              data.customer.taxId
                ? `
            <tr>
              
              <td class="value-small">Tax ID: ${escapeHtml(data.customer.taxId)}</td>
            </tr>`
                : ''
            }
          </table>
        </div>
        
        <div class="new-payment-method">
          <h3>Company Info.</h3>
          <table class="new-info-table">
            <tr>
              
              <td class="value">${escapeHtml(data.company.name)}</td>
              
            
            ${
              data.company.email
                ? `
            <tr>
              
              <td class="value">${escapeHtml(data.company.email)}</td>
             
            </tr>`
                : ''
            }
            <tr>
              
              <td class="value">${escapeHtml(data.company.address)}</td>
              
            </tr>
            </tr>
            ${
              data.company.phone
                ? `
            <tr>
              
              <td class="value-small">Tel: ${escapeHtml(data.company.phone)}</td>
             
            </tr>`
                : ''
            }
            
            <tr>
              
              <td class="value-small">Tax ID: ${escapeHtml(data.company.taxId)}</td>
              
            </tr>
          </table>
        </div>
      </div>

      <div class="new-table-section">
        <table class="new-items-table">
          <thead>
            <tr>
              <th class="text-center" style="width: 50px;">No.</th>
              <th class="text-left">ITEM DESCRIPTION</th>
              <th class="text-center" style="width: 80px;">QTY</th>
              <th class="text-center" style="width: 80px;">UNIT</th>
              <th class="text-right" style="width: 120px; padding-right: 20px;">PRICE</th>
              <th class="text-right" style="width: 120px; padding-right: 20px;">TOTAL</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml}
          </tbody>
        </table>
        
        <div class="new-totals-section">
          ${totalsHtml}
          <div class="new-amount-in-words">
            <span class="label">Amount in words</span>
            <span class="value">${escapeHtml(formatAmountInWords(grandTotal))}</span>
          </div>
        </div>
      </div>

      <div class="new-footer-section">
        <div class="new-footer-left" style="width: 100%;">
          <h2>REMAKE</h2>
          <div class="terms">
            
            <p>${escapeHtml(data.note || 'Lorem ipsum dolor sit amet delgado iner consectetueri adipiing in elite mor sedet diami nonummy nibhi euismod tincidunt utility laoreet dolore al desadi magnasted aliquad.')}</p>
          </div>
        </div>
      </div>

      ${renderSignatureFooter(data.customer.name, data.company.name, data.company.logoUrl)}

      <div class="new-footer-bottom-bar"></div>
    </div>
  `

  return wrapDocument(body, `ใบแจ้งหนี้ ${data.documentNumber}`)
}
