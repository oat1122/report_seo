import type { BillingDocumentRepository } from "../ports/BillingDocumentRepository";
import type { DocumentStorage } from "../ports/DocumentStorage";
import type { PdfRenderer } from "../ports/PdfRenderer";
import type { BillingCycleProvider } from "../ports/BillingCycleProvider";
import type { DocumentTemplateRepository } from "../ports/DocumentTemplateRepository";
import type { BillingDocumentType } from "../../domain/DocumentType";
import type { CompanySettings } from "@/features/company-settings/domain/CompanySettings";
import type { RenderData } from "./generateDocument";
import { BadRequestError, NotFoundError } from "@/lib/errors";
import { sanitizeFilename } from "@/infrastructure/upload/validators";

export interface UpdateDocumentDeps {
  repo: BillingDocumentRepository;
  storage: DocumentStorage;
  renderer: PdfRenderer;
  cycleProvider: BillingCycleProvider;
  templateRepo: DocumentTemplateRepository;
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
      items?: Array<{
        description: string;
        quantity: number;
        unit: string;
        unitPrice: number;
      }>;
    },
  ) => {
    const existingDoc = await deps.repo.getDocument(documentId);
    if (!existingDoc) throw new NotFoundError("ไม่พบเอกสาร");

    let renderItems: Array<{
      description: string;
      quantity: number;
      unit: string;
      unitPrice: number;
    }>;

    if (input.items && input.items.length > 0) {
      renderItems = input.items;
    } else {
      let templateId: string | null = null;
      if (existingDoc.billingCycleId) {
        const cycle = await deps.cycleProvider.getCycleById(
          existingDoc.billingCycleId,
        );
        if (cycle) {
          templateId = cycle.planDocumentTemplateId;
        }
      }

      if (!templateId) {
        throw new BadRequestError("ไม่พบ template สำหรับเอกสารนี้");
      }

      const template = await deps.templateRepo.findById(templateId);
      if (!template || template.items.length === 0) {
        throw new BadRequestError("Template ไม่มีรายการสินค้า/บริการ");
      }

      renderItems = template.items.map((i) => ({
        description: i.description,
        quantity: i.quantity,
        unit: i.unit,
        unitPrice: i.unitPrice,
      }));
    }

    const company = await deps.getCompanySettings();
    if (!company) {
      throw new BadRequestError("กรุณาตั้งค่าข้อมูลบริษัทก่อนแก้ไขเอกสาร");
    }

    const customer = await deps.repo.getCustomerForDocument(input.customerId);
    if (!customer) throw new BadRequestError("ไม่พบข้อมูลลูกค้า");

    const totalAmount = renderItems.reduce(
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
      items: renderItems,
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
