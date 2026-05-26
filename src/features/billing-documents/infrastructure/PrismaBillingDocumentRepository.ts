import { prisma } from "@/infrastructure/prisma/client";
import type {
  BillingDocument,
  AdminBillingDocument,
  BillingDocumentWithCycle,
} from "../domain/BillingDocument";
import type { DocumentItem } from "../domain/DocumentItem";
import type { BillingDocumentType } from "../domain/DocumentType";
import { getNextDocumentNumber as getNextDocNum } from "../domain/policies/document-number";
import type {
  BillingDocumentRepository,
  CreateDocumentInput,
  UpdateDocumentInput,
  AllDocumentsFilter,
  CustomerForDocument,
  DocumentItemInput,
} from "../application/ports/BillingDocumentRepository";

function toDocumentItem(row: {
  id: string;
  customerId: string;
  description: string;
  quantity: number;
  unit: string;
  unitPrice: unknown;
  orderIndex: number;
  createdAt: Date;
  updatedAt: Date;
}): DocumentItem {
  return {
    ...row,
    unitPrice: Number(row.unitPrice),
  };
}

function toBillingDocument(row: {
  id: string;
  documentNumber: string;
  type: string;
  pdfUrl: string;
  totalAmount: unknown;
  note: string | null;
  generatedAt: Date;
  customerId: string;
  billingCycleId: string | null;
}): BillingDocument {
  return {
    ...row,
    type: row.type as BillingDocumentType,
    totalAmount: Number(row.totalAmount),
  };
}

export class PrismaBillingDocumentRepository
  implements BillingDocumentRepository
{
  async listDocumentItems(customerId: string): Promise<DocumentItem[]> {
    const rows = await prisma.documentItem.findMany({
      where: { customerId },
      orderBy: { orderIndex: "asc" },
    });
    return rows.map(toDocumentItem);
  }

  async upsertDocumentItems(
    customerId: string,
    items: DocumentItemInput[],
  ): Promise<DocumentItem[]> {
    return prisma.$transaction(async (tx) => {
      const existingIds = items
        .map((i) => i.id)
        .filter((id): id is string => !!id);

      await tx.documentItem.deleteMany({
        where: {
          customerId,
          id: { notIn: existingIds },
        },
      });

      for (const item of items) {
        if (item.id) {
          await tx.documentItem.update({
            where: { id: item.id },
            data: {
              description: item.description,
              quantity: item.quantity,
              unit: item.unit,
              unitPrice: item.unitPrice,
              orderIndex: item.orderIndex,
            },
          });
        } else {
          await tx.documentItem.create({
            data: {
              customerId,
              description: item.description,
              quantity: item.quantity,
              unit: item.unit,
              unitPrice: item.unitPrice,
              orderIndex: item.orderIndex,
            },
          });
        }
      }

      const rows = await tx.documentItem.findMany({
        where: { customerId },
        orderBy: { orderIndex: "asc" },
      });
      return rows.map(toDocumentItem);
    });
  }

  async deleteDocumentItem(itemId: string): Promise<void> {
    await prisma.documentItem.delete({ where: { id: itemId } });
  }

  async createDocument(input: CreateDocumentInput): Promise<BillingDocument> {
    const row = await prisma.billingDocument.create({
      data: {
        documentNumber: input.documentNumber,
        type: input.type,
        pdfUrl: input.pdfUrl,
        totalAmount: input.totalAmount,
        note: input.note,
        customerId: input.customerId,
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
}
