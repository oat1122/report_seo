import { prisma } from "@/infrastructure/prisma/client";
import type {
  BillingDocument,
  AdminBillingDocument,
  BillingDocumentWithCycle,
} from "../domain/BillingDocument";
import type { BillingDocumentType } from "../domain/DocumentType";
import { getNextDocumentNumber as getNextDocNum } from "../domain/policies/document-number";
import type {
  BillingDocumentRepository,
  CreateDocumentInput,
  UpdateDocumentInput,
  AllDocumentsFilter,
  CustomerForDocument,
} from "../application/ports/BillingDocumentRepository";

function toBillingDocument(row: {
  id: string;
  documentNumber: string;
  type: string;
  pdfUrl: string;
  totalAmount: unknown;
  note: string | null;
  generatedAt: Date;
  customerId: string | null;
  customerName?: string | null;
  billingCycleId: string | null;
}): BillingDocument {
  return {
    ...row,
    type: row.type as BillingDocumentType,
    totalAmount: Number(row.totalAmount),
    customerName: row.customerName ?? null,
  };
}

export class PrismaBillingDocumentRepository
  implements BillingDocumentRepository
{
  async createDocument(input: CreateDocumentInput): Promise<BillingDocument> {
    const row = await prisma.billingDocument.create({
      data: {
        documentNumber: input.documentNumber,
        type: input.type,
        pdfUrl: input.pdfUrl,
        totalAmount: input.totalAmount,
        note: input.note,
        customerId: input.customerId,
        customerName: input.customerName ?? null,
        billingCycleId: input.billingCycleId,
      },
    });
    return toBillingDocument(row);
  }

  async listDocuments(
    customerId: string,
    type?: BillingDocumentType,
  ): Promise<BillingDocument[]> {
    const rows = await prisma.billingDocument.findMany({
      where: { customerId, ...(type ? { type } : {}) },
      orderBy: { generatedAt: "desc" },
    });
    return rows.map(toBillingDocument);
  }

  async getDocument(documentId: string): Promise<BillingDocument | null> {
    const row = await prisma.billingDocument.findUnique({
      where: { id: documentId },
    });
    return row ? toBillingDocument(row) : null;
  }

  async deleteDocument(documentId: string): Promise<void> {
    await prisma.billingDocument.delete({ where: { id: documentId } });
  }

  async getCustomerForDocument(
    customerId: string,
  ): Promise<CustomerForDocument | null> {
    return prisma.customer.findUnique({
      where: { id: customerId },
      select: {
        id: true,
        name: true,
        domain: true,
        address: true,
        taxId: true,
        contactName: true,
      },
    }) as Promise<CustomerForDocument | null>;
  }

  async getNextDocumentNumber(
    type: BillingDocumentType,
    year: number,
  ): Promise<string> {
    return prisma.$transaction((tx) => getNextDocNum(tx, type, year));
  }

  async updateDocument(
    documentId: string,
    input: UpdateDocumentInput,
  ): Promise<BillingDocument> {
    const row = await prisma.billingDocument.update({
      where: { id: documentId },
      data: {
        type: input.type,
        pdfUrl: input.pdfUrl,
        totalAmount: input.totalAmount,
        note: input.note,
      },
    });
    return toBillingDocument(row);
  }

  async listAllDocuments(
    filters?: AllDocumentsFilter,
  ): Promise<AdminBillingDocument[]> {
    const where: Record<string, unknown> = {};

    if (filters?.type) where.type = filters.type;
    if (filters?.customerId) where.customerId = filters.customerId;
    if (filters?.search) {
      where.OR = [
        { documentNumber: { contains: filters.search } },
        { customer: { name: { contains: filters.search } } },
        { customerName: { contains: filters.search } },
      ];
    }

    const rows = await prisma.billingDocument.findMany({
      where,
      include: {
        customer: { select: { id: true, userId: true, name: true, domain: true } },
        billingCycle: {
          select: {
            cycleNumber: true,
            dueDate: true,
            paidDate: true,
            amount: true,
            plan: { select: { id: true, description: true } },
          },
        },
      },
      orderBy: { generatedAt: "desc" },
      take: 200,
    });

    return rows.map((row) => ({
      ...toBillingDocument(row),
      customer: row.customer,
      billingCycle: row.billingCycle
        ? {
            cycleNumber: row.billingCycle.cycleNumber,
            dueDate: row.billingCycle.dueDate,
            paidDate: row.billingCycle.paidDate,
            amount: Number(row.billingCycle.amount),
            plan: row.billingCycle.plan,
          }
        : null,
    }));
  }

  async listDocumentsByCycleIds(
    cycleIds: string[],
  ): Promise<BillingDocumentWithCycle[]> {
    if (cycleIds.length === 0) return [];

    const rows = await prisma.billingDocument.findMany({
      where: { billingCycleId: { in: cycleIds } },
      include: {
        billingCycle: {
          select: {
            cycleNumber: true,
            dueDate: true,
            paidDate: true,
            amount: true,
            plan: { select: { id: true, description: true } },
          },
        },
      },
      orderBy: { generatedAt: "desc" },
    });

    return rows.map((row) => ({
      ...toBillingDocument(row),
      billingCycle: row.billingCycle
        ? {
            cycleNumber: row.billingCycle.cycleNumber,
            dueDate: row.billingCycle.dueDate,
            paidDate: row.billingCycle.paidDate,
            amount: Number(row.billingCycle.amount),
            plan: row.billingCycle.plan,
          }
        : null,
    }));
  }

  async searchCustomers(query: string): Promise<CustomerForDocument[]> {
    return prisma.customer.findMany({
      where: {
        OR: [
          { name: { contains: query } },
          { domain: { contains: query } },
        ],
      },
      select: {
        id: true,
        name: true,
        domain: true,
        address: true,
        taxId: true,
        contactName: true,
      },
      take: 20,
    }) as Promise<CustomerForDocument[]>;
  }
}
