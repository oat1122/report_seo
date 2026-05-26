import type { RenderData } from "../../application/use-cases/generateDocument";
import {
  wrapDocument,
  formatCurrency,
  formatDate,
  renderCompanyHeader,
  renderCustomerSection,
  renderItemsTable,
  renderNote,
  renderSignatureFooter,
} from "./base-template";

export function renderInvoice(data: RenderData): string {
  const subtotal = data.items.reduce(
    (sum, i) => sum + i.quantity * i.unitPrice,
    0,
  );

  const dueDateHtml = data.dueDate
    ? `<div class="meta-row">
        <span class="meta-label">กำหนดชำระ:</span>
        <span class="meta-value">${formatDate(data.dueDate)}</span>
      </div>`
    : "";

  const body = `
    ${renderCompanyHeader(data.company, "ใบแจ้งหนี้", data.documentNumber, data.generatedAt)}
    ${renderCustomerSection(data.customer)}
    ${dueDateHtml}
    ${renderItemsTable(data.items)}
    <div class="totals">
      <div class="totals-box">
        <div class="totals-row grand-total">
          <span>รวมทั้งสิ้น</span>
          <span>${formatCurrency(subtotal)} บาท</span>
        </div>
      </div>
    </div>
    ${renderNote(data.note)}
    ${renderSignatureFooter()}
  `;

  return wrapDocument(body, `ใบแจ้งหนี้ ${data.documentNumber}`);
}
