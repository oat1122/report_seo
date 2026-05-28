import { prisma } from '@/infrastructure/prisma/client'
import type {
  DocumentTemplate,
  DocumentTemplateDetail,
  DocumentTemplateItem,
  DocumentTemplateScope,
} from '../domain/DocumentTemplate'
import type {
  DocumentTemplateRepository,
  CreateTemplateData,
  UpdateTemplateData,
  TemplateItemInput,
} from '../application/ports/DocumentTemplateRepository'

function toTemplate(row: {
  id: string
  name: string
  scope: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}): DocumentTemplate {
  return {
    ...row,
    scope: row.scope as DocumentTemplateScope,
  }
}

function toItem(row: {
  id: string
  templateId: string
  description: string
  quantity: number
  unit: string
  unitPrice: unknown
  orderIndex: number
}): DocumentTemplateItem {
  return {
    ...row,
    unitPrice: Number(row.unitPrice),
  }
}

function toDetail(row: {
  id: string
  name: string
  scope: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
  items: Array<{
    id: string
    templateId: string
    description: string
    quantity: number
    unit: string
    unitPrice: unknown
    orderIndex: number
  }>
}): DocumentTemplateDetail {
  return {
    ...toTemplate(row),
    items: row.items.map(toItem),
  }
}

export class PrismaDocumentTemplateRepository implements DocumentTemplateRepository {
  async list(scope?: DocumentTemplateScope): Promise<DocumentTemplate[]> {
    const rows = await prisma.documentTemplate.findMany({
      where: scope ? { scope } : undefined,
      orderBy: { createdAt: 'desc' },
    })
    return rows.map(toTemplate)
  }

  async findById(id: string): Promise<DocumentTemplateDetail | null> {
    const row = await prisma.documentTemplate.findUnique({
      where: { id },
      include: { items: { orderBy: { orderIndex: 'asc' } } },
    })
    return row ? toDetail(row) : null
  }

  async create(data: CreateTemplateData): Promise<DocumentTemplateDetail> {
    const row = await prisma.documentTemplate.create({
      data: {
        name: data.name,
        scope: data.scope,
        isActive: data.isActive ?? true,
        items: data.items
          ? {
              create: data.items.map((item) => ({
                description: item.description,
                quantity: item.quantity,
                unit: item.unit,
                unitPrice: item.unitPrice,
                orderIndex: item.orderIndex,
              })),
            }
          : undefined,
      },
      include: { items: { orderBy: { orderIndex: 'asc' } } },
    })
    return toDetail(row)
  }

  async update(id: string, data: UpdateTemplateData): Promise<DocumentTemplate> {
    const row = await prisma.documentTemplate.update({
      where: { id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.scope !== undefined && { scope: data.scope }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
      },
    })
    return toTemplate(row)
  }

  async delete(id: string): Promise<void> {
    await prisma.documentTemplate.delete({ where: { id } })
  }

  async upsertItems(
    templateId: string,
    items: TemplateItemInput[],
  ): Promise<DocumentTemplateItem[]> {
    return prisma.$transaction(async (tx) => {
      const existingIds = items.map((i) => i.id).filter((id): id is string => !!id)

      await tx.documentTemplateItem.deleteMany({
        where: {
          templateId,
          id: { notIn: existingIds },
        },
      })

      for (const item of items) {
        if (item.id) {
          await tx.documentTemplateItem.update({
            where: { id: item.id },
            data: {
              description: item.description,
              quantity: item.quantity,
              unit: item.unit,
              unitPrice: item.unitPrice,
              orderIndex: item.orderIndex,
            },
          })
        } else {
          await tx.documentTemplateItem.create({
            data: {
              templateId,
              description: item.description,
              quantity: item.quantity,
              unit: item.unit,
              unitPrice: item.unitPrice,
              orderIndex: item.orderIndex,
            },
          })
        }
      }

      const rows = await tx.documentTemplateItem.findMany({
        where: { templateId },
        orderBy: { orderIndex: 'asc' },
      })
      return rows.map(toItem)
    })
  }
}
