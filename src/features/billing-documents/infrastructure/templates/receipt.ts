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

export function renderReceipt(data: RenderData): string {
  const subtotal = data.items.reduce(
    (sum, i) => sum + i.quantity * i.unitPrice,
    0,
  );

  const paidDateHtml = data.paidDate
    ? `<div class="meta-row">
        <span class="meta-label">วันที่ชำระ:</span>
        <span class="meta-value">${formatDate(data.paidDate)}</span>
      </div>`
    : "";

  const body = `
    ${renderCompanyHeader(data.company, "ใบเสร็จรับเงิน", data.documentNumber, data.generatedAt)}
    ${renderCustomerSection(data.customer)}
    ${paidDateHtml}
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

  return wrapDocument(body, `ใบเสร็จรับเงิน ${data.documentNumber}`);
}
