import { Prisma } from '@prisma/client'
import { prisma } from '@/infrastructure/prisma/client'
import type {
  BillingDocument,
  AdminBillingDocument,
  BillingDocumentWithCycle,
  DocumentLineItem,
} from '../domain/BillingDocument'
import type { BillingDocumentType } from '../domain/DocumentType'
import { getNextDocumentNumber as getNextDocNum } from '../domain/policies/document-number'
import type {
  BillingDocumentRepository,
  CreateDocumentInput,
  UpdateDocumentInput,
  AllDocumentsFilter,
  CustomerForDocument,
  UpdateCustomerInfoInput,
  CycleInvoiceData,
} from '../application/ports/BillingDocumentRepository'

// email มาจากบัญชี User ของลูกค้า (read-only) — ไม่มี column email บน Customer
const customerForDocumentSelect = {
  id: true,
  name: true,
  domain: true,
  address: true,
  taxId: true,
  contactName: true,
  phone: true,
  user: { select: { email: true } },
} as const

function toCustomerForDocument(row: {
  id: string
  name: string
  domain: string
  address: string | null
  taxId: string | null
  contactName: string | null
  phone: string | null
  user: { email: string } | null
}): CustomerForDocument {
  const { user, ...rest } = row
  return { ...rest, email: user?.email ?? null }
}

function toBillingDocument(row: {
  id: string
  documentNumber: string
  type: string
  pdfUrl: string
  totalAmount: unknown
  items?: unknown
  note: string | null
  dueDate?: Date | null
  paidDate?: Date | null
  generatedAt: Date
  customerId: string | null
  customerName?: string | null
  billingCycleId: string | null
}): BillingDocument {
  return {
    ...row,
    type: row.type as BillingDocumentType,
    totalAmount: Number(row.totalAmount),
    items: (row.items as DocumentLineItem[] | null) ?? null,
    dueDate: row.dueDate ?? null,
    paidDate: row.paidDate ?? null,
    customerName: row.customerName ?? null,
  }
}

export class PrismaBillingDocumentRepository implements BillingDocumentRepository {
  async createDocument(input: CreateDocumentInput): Promise<BillingDocument> {
    const row = await prisma.billingDocument.create({
      data: {
        documentNumber: input.documentNumber,
        type: input.type,
        pdfUrl: input.pdfUrl,
        totalAmount: input.totalAmount,
        items: input.items as Prisma.InputJsonValue,
        note: input.note,
        dueDate: input.dueDate ?? null,
        paidDate: input.paidDate ?? null,
        customerId: input.customerId,
        customerName: input.customerName ?? null,
        billingCycleId: input.billingCycleId,
      },
    })
    return toBillingDocument(row)
  }

  async listDocuments(customerId: string, type?: BillingDocumentType): Promise<BillingDocument[]> {
    const rows = await prisma.billingDocument.findMany({
      where: { customerId, ...(type ? { type } : {}) },
      orderBy: { generatedAt: 'desc' },
    })
    return rows.map(toBillingDocument)
  }

  async getDocument(documentId: string): Promise<BillingDocument | null> {
    const row = await prisma.billingDocument.findUnique({
      where: { id: documentId },
    })
    return row ? toBillingDocument(row) : null
  }

  async deleteDocument(documentId: string): Promise<void> {
    await prisma.billingDocument.delete({ where: { id: documentId } })
  }

  async getCustomerForDocument(customerId: string): Promise<CustomerForDocument | null> {
    const row = await prisma.customer.findUnique({
      where: { id: customerId },
      select: customerForDocumentSelect,
    })
    return row ? toCustomerForDocument(row) : null
  }

  async updateCustomerInfo(customerId: string, input: UpdateCustomerInfoInput): Promise<void> {
    await prisma.customer.update({
      where: { id: customerId },
      data: {
        name: input.name,
        address: input.address,
        taxId: input.taxId,
        contactName: input.contactName,
        phone: input.phone,
      },
    })
  }

  async getNextDocumentNumber(type: BillingDocumentType, year: number): Promise<string> {
    return prisma.$transaction((tx) => getNextDocNum(tx, type, year))
  }

  async updateDocument(documentId: string, input: UpdateDocumentInput): Promise<BillingDocument> {
    const row = await prisma.billingDocument.update({
      where: { id: documentId },
      data: {
        type: input.type,
        pdfUrl: input.pdfUrl,
        totalAmount: input.totalAmount,
        items: input.items as Prisma.InputJsonValue,
        note: input.note,
        ...(input.dueDate !== undefined ? { dueDate: input.dueDate } : {}),
        ...(input.paidDate !== undefined ? { paidDate: input.paidDate } : {}),
        ...(input.customerName !== undefined ? { customerName: input.customerName } : {}),
        ...(input.billingCycleId !== undefined ? { billingCycleId: input.billingCycleId } : {}),
      },
    })
    return toBillingDocument(row)
  }

  async setDocumentCycle(
    documentId: string,
    billingCycleId: string | null,
  ): Promise<BillingDocument> {
    const row = await prisma.billingDocument.update({
      where: { id: documentId },
      data: { billingCycleId },
    })
    return toBillingDocument(row)
  }

  async getCycleForCustomer(
    cycleId: string,
    customerId: string,
  ): Promise<{ id: string; dueDate: Date } | null> {
    return prisma.billingCycle.findFirst({
      where: { id: cycleId, plan: { customerId } },
      select: { id: true, dueDate: true },
    })
  }

  async getCycleInvoiceData(
    cycleId: string,
    customerId: string,
  ): Promise<CycleInvoiceData | null> {
    const row = await prisma.billingCycle.findFirst({
      where: { id: cycleId, plan: { customerId } },
      select: {
        cycleNumber: true,
        amount: true,
        dueDate: true,
        plan: { select: { description: true } },
      },
    })
    if (!row) return null
    return {
      cycleNumber: row.cycleNumber,
      amount: Number(row.amount),
      dueDate: row.dueDate,
      planDescription: row.plan.description,
    }
  }

  async cycleHasInvoiceDocument(cycleId: string, customerId: string): Promise<boolean> {
    const count = await prisma.billingDocument.count({
      where: {
        billingCycleId: cycleId,
        type: 'INVOICE',
        billingCycle: { plan: { customerId } },
      },
    })
    return count > 0
  }

  async listAllDocuments(filters?: AllDocumentsFilter): Promise<AdminBillingDocument[]> {
    const where: Record<string, unknown> = {}

    if (filters?.type) where.type = filters.type
    if (filters?.customerId) where.customerId = filters.customerId
    if (filters?.search) {
      where.OR = [
        { documentNumber: { contains: filters.search } },
        { customer: { name: { contains: filters.search } } },
        { customerName: { contains: filters.search } },
      ]
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
      orderBy: { generatedAt: 'desc' },
      take: 200,
    })

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
    }))
  }

  async listDocumentsByCycleIds(cycleIds: string[]): Promise<BillingDocumentWithCycle[]> {
    if (cycleIds.length === 0) return []

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
      orderBy: { generatedAt: 'desc' },
    })

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
    }))
  }

  async searchCustomers(query: string): Promise<CustomerForDocument[]> {
    const trimmed = query.trim()
    const rows = await prisma.customer.findMany({
      where: trimmed
        ? { OR: [{ name: { contains: trimmed } }, { domain: { contains: trimmed } }] }
        : undefined,
      select: customerForDocumentSelect,
      orderBy: { name: 'asc' },
      take: 50,
    })
    return rows.map(toCustomerForDocument)
  }
}
