import type { BillingDocumentRepository } from "../ports/BillingDocumentRepository";
import type { DocumentStorage } from "../ports/DocumentStorage";
import type { PdfRenderer } from "../ports/PdfRenderer";
import type { BillingDocumentType } from "../../domain/DocumentType";
import type { CompanySettings } from "@/features/company-settings/domain/CompanySettings";
import { BadRequestError } from "@/lib/errors";
import { sanitizeFilename } from "@/infrastructure/upload/validators";

export interface GenerateDocumentDeps {
  repo: BillingDocumentRepository;
  storage: DocumentStorage;
  renderer: PdfRenderer;
  getCompanySettings: () => Promise<CompanySettings | null>;
  renderDocumentHtml: (data: RenderData) => string;
}

export interface RenderData {
  type: BillingDocumentType;
  documentNumber: string;
  company: CompanySettings;
  customer: {
    name: string;
    address: string | null;
    taxId: string | null;
    contactName: string | null;
  };
  items: Array<{
    description: string;
    quantity: number;
    unit: string;
    unitPrice: number;
  }>;
  note: string | null;
  dueDate: string | null;
  paidDate: string | null;
  generatedAt: Date;
}

export function generateDocumentUseCase(deps: GenerateDocumentDeps) {
  return async (input: {
    customerId: string;
    type: BillingDocumentType;
    billingCycleId?: string | null;
    note?: string | null;
    dueDate?: string | null;
    paidDate?: string | null;
  }) => {
    const company = await deps.getCompanySettings();
    if (!company) {
      throw new BadRequestError(
        "กรุณาตั้งค่าข้อมูลบริษัทก่อนสร้างเอกสาร",
      );
    }

    const customer = await deps.repo.getCustomerForDocument(input.customerId);
    if (!customer) {
      throw new BadRequestError("ไม่พบข้อมูลลูกค้า");
    }

    const items = await deps.repo.listDocumentItems(input.customerId);
    if (items.length === 0) {
      throw new BadRequestError("ลูกค้ายังไม่มีรายการสินค้า/บริการ");
    }

    const year = new Date().getFullYear();
    const documentNumber = await deps.repo.getNextDocumentNumber(
      input.type,
      year,
    );

    const totalAmount = items.reduce(
      (sum, item) => sum + item.quantity * item.unitPrice,
      0,
    );

    const now = new Date();
    const html = deps.renderDocumentHtml({
      type: input.type,
      documentNumber,
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
      generatedAt: now,
    });

    const pdfBuffer = await deps.renderer.renderToPdf(html);
    const filename = sanitizeFilename(`${documentNumber}.pdf`);
    const pdfUrl = await deps.storage.savePdf(pdfBuffer, filename);

    return deps.repo.createDocument({
      customerId: input.customerId,
      documentNumber,
      type: input.type,
      pdfUrl,
      totalAmount,
      note: input.note ?? null,
      billingCycleId: input.billingCycleId ?? null,
    });
  };
}
