import { prisma } from "@/infrastructure/prisma/client";
import type {
  WorkProgressTemplate,
  WorkProgressTemplateDetail,
  WorkProgressTemplateItem,
} from "../domain/WorkProgressTemplate";
import type {
  CreateTemplateData,
  CreateTemplateItemData,
  UpdateTemplateData,
  UpdateTemplateItemData,
  WorkProgressTemplateRepository,
} from "../application/ports/WorkProgressTemplateRepository";

export class PrismaWorkProgressTemplateRepository
  implements WorkProgressTemplateRepository
{
  async list(options: {
    includeInactive: boolean;
  }): Promise<WorkProgressTemplate[]> {
    const rows = await prisma.workProgressTemplate.findMany({
      where: options.includeInactive ? undefined : { isActive: true },
      orderBy: [{ isSystem: "desc" }, { name: "asc" }],
    });
    return rows as unknown as WorkProgressTemplate[];
  }

  async findById(id: string): Promise<WorkProgressTemplateDetail | null> {
    const row = await prisma.workProgressTemplate.findUnique({
      where: { id },
      include: { items: { orderBy: { orderIndex: "asc" } } },
    });
    if (!row) return null;
    return row as unknown as WorkProgressTemplateDetail;
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
          isActive: data.isActive,
          createdById: data.createdById,
        },
      });
      if (items.length > 0) {
        await tx.workProgressTemplateItem.createMany({
          data: items.map((it, i) => ({
            templateId: template.id,
            categoryId: it.categoryId,
            activity: it.activity,
            description: it.description,
            duration: it.duration,
            weight: it.weight,
            orderIndex: it.orderIndex ?? i,
            defaultPeriods: it.defaultPeriods ?? undefined,
          })),
        });
      }
      const detail = await tx.workProgressTemplate.findUnique({
        where: { id: template.id },
        include: { items: { orderBy: { orderIndex: "asc" } } },
      });
      return detail as unknown as WorkProgressTemplateDetail;
    });
  }

  async update(
    id: string,
    data: UpdateTemplateData,
  ): Promise<WorkProgressTemplate> {
    const row = await prisma.workProgressTemplate.update({
      where: { id },
      data,
    });
    return row as unknown as WorkProgressTemplate;
  }

  async delete(id: string): Promise<void> {
    await prisma.workProgressTemplate.delete({ where: { id } });
  }

  async addItem(
    templateId: string,
    data: CreateTemplateItemData,
  ): Promise<WorkProgressTemplateItem> {
    const row = await prisma.workProgressTemplateItem.create({
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
    });
    return row as unknown as WorkProgressTemplateItem;
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
    });
    return row as unknown as WorkProgressTemplateItem;
  }

  async deleteItem(itemId: string): Promise<void> {
    await prisma.workProgressTemplateItem.delete({ where: { id: itemId } });
  }

  async findItemById(
    itemId: string,
  ): Promise<
    | (WorkProgressTemplateItem & { template: WorkProgressTemplate })
    | null
  > {
    const row = await prisma.workProgressTemplateItem.findUnique({
      where: { id: itemId },
      include: { template: true },
    });
    if (!row) return null;
    return row as unknown as WorkProgressTemplateItem & {
      template: WorkProgressTemplate;
    };
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
    );
  }
}
