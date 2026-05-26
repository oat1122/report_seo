import type { RenderData } from "../../application/use-cases/generateDocument";
import {
  wrapDocument,
  formatCurrency,
  renderCompanyHeader,
  renderCustomerSection,
  renderItemsTable,
  renderNote,
  renderSignatureFooter,
} from "./base-template";

export function renderBillingNote(data: RenderData): string {
  const subtotal = data.items.reduce(
    (sum, i) => sum + i.quantity * i.unitPrice,
    0,
  );

  const body = `
    ${renderCompanyHeader(data.company, "ใบวางบิล", data.documentNumber, data.generatedAt)}
    ${renderCustomerSection(data.customer)}
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

  return wrapDocument(body, `ใบวางบิล ${data.documentNumber}`);
}
