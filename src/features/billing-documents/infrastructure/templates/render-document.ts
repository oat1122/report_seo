import type { RenderData } from "../../application/use-cases/generateDocument";
import { renderBillingNote } from "./billing-note";
import { renderInvoice } from "./invoice";
import { renderReceipt } from "./receipt";
import { renderTaxInvoice } from "./tax-invoice";

export function renderDocumentHtml(data: RenderData): string {
  switch (data.type) {
    case "BILLING_NOTE":
      return renderBillingNote(data);
    case "INVOICE":
      return renderInvoice(data);
    case "RECEIPT":
      return renderReceipt(data);
    case "TAX_INVOICE":
      return renderTaxInvoice(data);
  }
}
