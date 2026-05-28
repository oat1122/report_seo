import { prisma } from '@/infrastructure/prisma/client'
import type {
  WorkProgressTemplate,
  WorkProgressTemplateDetail,
  WorkProgressTemplateItem,
  WorkProgressTemplateSubtask,
} from '../domain/WorkProgressTemplate'
import type {
  CreateTemplateData,
  CreateTemplateItemData,
  TemplateSubtaskSeed,
  UpdateTemplateData,
  UpdateTemplateItemData,
  WorkProgressTemplateRepository,
} from '../application/ports/WorkProgressTemplateRepository'

export class PrismaWorkProgressTemplateRepository implements WorkProgressTemplateRepository {
  async list(options: { includeInactive: boolean }): Promise<WorkProgressTemplate[]> {
    const rows = await prisma.workProgressTemplate.findMany({
      where: options.includeInactive ? undefined : { isActive: true },
      orderBy: [{ isSystem: 'desc' }, { name: 'asc' }],
    })
    return rows as unknown as WorkProgressTemplate[]
  }

  async findById(id: string): Promise<WorkProgressTemplateDetail | null> {
    const row = await prisma.workProgressTemplate.findUnique({
      where: { id },
      include: {
        items: {
          orderBy: { orderIndex: 'asc' },
          include: {
            subtasks: { orderBy: { orderIndex: 'asc' } },
          },
        },
      },
    })
    if (!row) return null
    return row as unknown as WorkProgressTemplateDetail
  }

  async create(
    data: CreateTemplateData,
    items: readonly CreateTemplateItemData[],
  ): Promise<WorkProgressTemplateDetail> {
    return prisma.$transaction(async (tx) => {
      const template = await tx.workProgressTemplate.create({
        data: {
          name: data.name,
          description: data.description,
          periodType: data.periodType,
          durationMonths: data.durationMonths,
          isActive: data.isActive,
          createdById: data.createdById,
        },
      })
      for (const [i, it] of items.entries()) {
        const created = await tx.workProgressTemplateItem.create({
          data: {
            templateId: template.id,
            categoryId: it.categoryId,
            activity: it.activity,
            description: it.description,
            duration: it.duration,
            weight: it.weight,
            orderIndex: it.orderIndex ?? i,
            defaultPeriods: it.defaultPeriods ?? undefined,
          },
        })
        if (it.subtasks && it.subtasks.length > 0) {
          await tx.workProgressTemplateSubtask.createMany({
            data: it.subtasks.map((s, idx) => ({
              templateItemId: created.id,
              title: s.title,
              orderIndex: s.orderIndex ?? idx,
            })),
          })
        }
      }
      const detail = await tx.workProgressTemplate.findUnique({
        where: { id: template.id },
        include: {
          items: {
            orderBy: { orderIndex: 'asc' },
            include: { subtasks: { orderBy: { orderIndex: 'asc' } } },
          },
        },
      })
      return detail as unknown as WorkProgressTemplateDetail
    })
  }

  async update(id: string, data: UpdateTemplateData): Promise<WorkProgressTemplate> {
    const row = await prisma.workProgressTemplate.update({
      where: { id },
      data,
    })
    return row as unknown as WorkProgressTemplate
  }

  async delete(id: string): Promise<void> {
    await prisma.workProgressTemplate.delete({ where: { id } })
  }

  async addItem(
    templateId: string,
    data: CreateTemplateItemData,
  ): Promise<WorkProgressTemplateItem> {
    return prisma.$transaction(async (tx) => {
      const created = await tx.workProgressTemplateItem.create({
        data: {
          templateId,
          categoryId: data.categoryId,
          activity: data.activity,
          description: data.description,
          duration: data.duration,
          weight: data.weight,
          orderIndex: data.orderIndex,
          defaultPeriods: data.defaultPeriods ?? undefined,
        },
      })
      if (data.subtasks && data.subtasks.length > 0) {
        await tx.workProgressTemplateSubtask.createMany({
          data: data.subtasks.map((s, idx) => ({
            templateItemId: created.id,
            title: s.title,
            orderIndex: s.orderIndex ?? idx,
          })),
        })
      }
      const withSubs = await tx.workProgressTemplateItem.findUnique({
        where: { id: created.id },
        include: { subtasks: { orderBy: { orderIndex: 'asc' } } },
      })
      return withSubs as unknown as WorkProgressTemplateItem
    })
  }

  async updateItem(
    itemId: string,
    data: UpdateTemplateItemData,
  ): Promise<WorkProgressTemplateItem> {
    const row = await prisma.workProgressTemplateItem.update({
      where: { id: itemId },
      data: {
        categoryId: data.categoryId,
        activity: data.activity,
        description: data.description,
        duration: data.duration,
        weight: data.weight,
        orderIndex: data.orderIndex,
        defaultPeriods: data.defaultPeriods ?? undefined,
      },
      include: { subtasks: { orderBy: { orderIndex: 'asc' } } },
    })
    return row as unknown as WorkProgressTemplateItem
  }

  async deleteItem(itemId: string): Promise<void> {
    await prisma.workProgressTemplateItem.delete({ where: { id: itemId } })
  }

  async findItemById(
    itemId: string,
  ): Promise<(WorkProgressTemplateItem & { template: WorkProgressTemplate }) | null> {
    const row = await prisma.workProgressTemplateItem.findUnique({
      where: { id: itemId },
      include: {
        template: true,
        subtasks: { orderBy: { orderIndex: 'asc' } },
      },
    })
    if (!row) return null
    return row as unknown as WorkProgressTemplateItem & {
      template: WorkProgressTemplate
    }
  }

  async reorderItems(
    templateId: string,
    order: ReadonlyArray<{ itemId: string; orderIndex: number }>,
  ): Promise<void> {
    await prisma.$transaction(
      order.map((entry) =>
        prisma.workProgressTemplateItem.updateMany({
          where: { id: entry.itemId, templateId },
          data: { orderIndex: entry.orderIndex },
        }),
      ),
    )
  }

  async listItemSubtasks(itemId: string): Promise<WorkProgressTemplateSubtask[]> {
    const rows = await prisma.workProgressTemplateSubtask.findMany({
      where: { templateItemId: itemId },
      orderBy: { orderIndex: 'asc' },
    })
    return rows as unknown as WorkProgressTemplateSubtask[]
  }

  async addItemSubtask(
    itemId: string,
    data: TemplateSubtaskSeed,
  ): Promise<WorkProgressTemplateSubtask> {
    const orderIndex =
      data.orderIndex ??
      (await prisma.workProgressTemplateSubtask.count({
        where: { templateItemId: itemId },
      }))
    const row = await prisma.workProgressTemplateSubtask.create({
      data: {
        templateItemId: itemId,
        title: data.title,
        orderIndex,
      },
    })
    return row as unknown as WorkProgressTemplateSubtask
  }

  async updateItemSubtask(
    subtaskId: string,
    data: { title?: string; orderIndex?: number },
  ): Promise<WorkProgressTemplateSubtask> {
    const row = await prisma.workProgressTemplateSubtask.update({
      where: { id: subtaskId },
      data,
    })
    return row as unknown as WorkProgressTemplateSubtask
  }

  async deleteItemSubtask(subtaskId: string): Promise<void> {
    await prisma.workProgressTemplateSubtask.delete({
      where: { id: subtaskId },
    })
  }

  async findItemSubtaskById(subtaskId: string): Promise<
    | (WorkProgressTemplateSubtask & {
        templateItem: WorkProgressTemplateItem & {
          template: WorkProgressTemplate
        }
      })
    | null
  > {
    const row = await prisma.workProgressTemplateSubtask.findUnique({
      where: { id: subtaskId },
      include: {
        templateItem: { include: { template: true } },
      },
    })
    if (!row) return null
    return row as unknown as WorkProgressTemplateSubtask & {
      templateItem: WorkProgressTemplateItem & {
        template: WorkProgressTemplate
      }
    }
  }

  async replaceItemSubtasks(
    itemId: string,
    subtasks: readonly TemplateSubtaskSeed[],
  ): Promise<void> {
    await prisma.$transaction(async (tx) => {
      await tx.workProgressTemplateSubtask.deleteMany({
        where: { templateItemId: itemId },
      })
      if (subtasks.length > 0) {
        await tx.workProgressTemplateSubtask.createMany({
          data: subtasks.map((s, idx) => ({
            templateItemId: itemId,
            title: s.title,
            orderIndex: s.orderIndex ?? idx,
          })),
        })
      }
    })
  }
}
