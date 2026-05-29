import type { RenderData } from '../../application/use-cases/render-data'
import {
  wrapDocument,
  formatCurrency,
  formatDate,
  escapeHtml,
  resolveLogoSrc,
} from './base-template'

export function renderInvoice(data: RenderData): string {
  const subtotal = data.items.reduce((sum, i) => sum + i.quantity * i.unitPrice, 0)

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
      </td>
      <td class="text-center">${item.quantity}</td>
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
              <td class="label">Name</td>
              <td class="value">: ${escapeHtml(data.customer.name)}</td>
            </tr>
            <tr>
              <td class="label">Phone</td>
              <td class="value">: ${escapeHtml(data.customer.phone || '-')}</td>
            </tr>
            <tr>
              <td class="label" style="vertical-align: top;">Address</td>
              <td class="value">: ${escapeHtml(addressLine || '-')}</td>
            </tr>
            ${
              data.customer.taxId
                ? `
            <tr>
              <td class="label">Tax ID</td>
              <td class="value">: ${escapeHtml(data.customer.taxId)}</td>
            </tr>`
                : ''
            }
          </table>
        </div>
        
        <div class="new-payment-method">
          <h3>Company Info.</h3>
          <table class="new-info-table">
            <tr>
              <td class="label">Name</td>
              <td class="value">: ${escapeHtml(data.company.name)}</td>
            </tr>
            ${
              data.company.phone
                ? `
            <tr>
              <td class="label">Phone</td>
              <td class="value">: ${escapeHtml(data.company.phone)}</td>
            </tr>`
                : ''
            }
            ${
              data.company.email
                ? `
            <tr>
              <td class="label">Mail</td>
              <td class="value">: ${escapeHtml(data.company.email)}</td>
            </tr>`
                : ''
            }
            <tr>
              <td class="label" style="vertical-align: top;">Address</td>
              <td class="value">: ${escapeHtml(data.company.address)}</td>
            </tr>
            
            <tr>
              <td class="label">Tax ID</td>
              <td class="value">: ${escapeHtml(data.company.taxId)}</td>
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
              <th class="text-right" style="width: 120px; padding-right: 20px;">PRICE</th>
              <th class="text-right" style="width: 120px; padding-right: 20px;">TOTAL</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml}
          </tbody>
        </table>
        
        <div class="new-totals-section">
          <div class="new-grand-total">
            <span class="label">Grand Total</span>
            <span class="value">${formatCurrency(subtotal)}</span>
          </div>
        </div>
      </div>

      <div class="new-footer-section">
        <div class="new-footer-left">
          <p class="best-regards">Best Regards,</p>
          <p class="company-signer">${escapeHtml(data.company.name)}</p>
          <div class="footer-contact-line"></div>
          
          <h4 class="contact-title">Contact.</h4>
          <table class="new-info-table">
            <tr>
              <td class="label">Phone</td>
              <td class="value">: ${escapeHtml(data.company.phone || '-')}</td>
            </tr>
            <tr>
              <td class="label">Mail</td>
              <td class="value">: ${escapeHtml(data.company.email || '-')}</td>
            </tr>
            <tr>
              <td class="label">Website</td>
              <td class="value">: -</td>
            </tr>
          </table>
        </div>
        
        <div class="new-footer-right">
          <h2>THANK YOU</h2>
          <div class="terms">
            <h4>Terms and Condition.</h4>
            <p>${escapeHtml(data.note || 'Lorem ipsum dolor sit amet delgado iner consectetueri adipiing in elite mor sedet diami nonummy nibhi euismod tincidunt utility laoreet dolore al desadi magnasted aliquad.')}</p>
          </div>
        </div>
      </div>
      <div class="new-footer-bottom-bar"></div>
    </div>
  `

  return wrapDocument(body, `ใบแจ้งหนี้ ${data.documentNumber}`)
}
