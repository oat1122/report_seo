import type { BillingDocumentRepository } from "../ports/BillingDocumentRepository";
import type { DocumentStorage } from "../ports/DocumentStorage";
import type { PdfRenderer } from "../ports/PdfRenderer";
import type { BillingDocumentType } from "../../domain/DocumentType";
import type { CompanySettings } from "@/features/company-settings/domain/CompanySettings";
import type { RenderData } from "./generateDocument";
import { BadRequestError, NotFoundError } from "@/lib/errors";
import { sanitizeFilename } from "@/infrastructure/upload/validators";

export interface UpdateDocumentDeps {
  repo: BillingDocumentRepository;
  storage: DocumentStorage;
  renderer: PdfRenderer;
  getCompanySettings: () => Promise<CompanySettings | null>;
  renderDocumentHtml: (data: RenderData) => string;
}

export function updateDocumentUseCase(deps: UpdateDocumentDeps) {
  return async (
    documentId: string,
    input: {
      customerId: string;
      type: BillingDocumentType;
      note?: string | null;
      dueDate?: string | null;
      paidDate?: string | null;
    },
  ) => {
    const existingDoc = await deps.repo.getDocument(documentId);
    if (!existingDoc) throw new NotFoundError("ไม่พบเอกสาร");

    const company = await deps.getCompanySettings();
    if (!company) {
      throw new BadRequestError("กรุณาตั้งค่าข้อมูลบริษัทก่อนแก้ไขเอกสาร");
    }

    const customer = await deps.repo.getCustomerForDocument(input.customerId);
    if (!customer) throw new BadRequestError("ไม่พบข้อมูลลูกค้า");

    const items = await deps.repo.listDocumentItems(input.customerId);
    if (items.length === 0) {
      throw new BadRequestError("ลูกค้ายังไม่มีรายการสินค้า/บริการ");
    }

    const totalAmount = items.reduce(
      (sum, item) => sum + item.quantity * item.unitPrice,
      0,
    );

    const html = deps.renderDocumentHtml({
      type: input.type,
      documentNumber: existingDoc.documentNumber,
      company,
      customer: {
        name: customer.name,
        address: customer.address,
        taxId: customer.taxId,
        contactName: customer.contactName,
      },
      items: items.map((i) => ({
        description: i.description,
        quantity: i.quantity,
        unit: i.unit,
        unitPrice: i.unitPrice,
      })),
      note: input.note ?? null,
      dueDate: input.dueDate ?? null,
      paidDate: input.paidDate ?? null,
      generatedAt: existingDoc.generatedAt,
    });

    const pdfBuffer = await deps.renderer.renderToPdf(html);

    await deps.storage.deletePdf(existingDoc.pdfUrl);

    const filename = sanitizeFilename(
      `${existingDoc.documentNumber}.pdf`,
    );
    const pdfUrl = await deps.storage.savePdf(pdfBuffer, filename);

    return deps.repo.updateDocument(documentId, {
      type: input.type,
      pdfUrl,
      totalAmount,
      note: input.note ?? null,
    });
  };
}
