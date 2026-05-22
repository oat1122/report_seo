import { prisma } from "@/infrastructure/prisma/client";
import type { WorkProgressSubtask } from "../domain/WorkProgressSubtask";
import type {
  AddSubtaskData,
  UpdateSubtaskData,
  WorkProgressSubtaskRepository,
} from "../application/ports/WorkProgressSubtaskRepository";

export class PrismaWorkProgressSubtaskRepository
  implements WorkProgressSubtaskRepository
{
  listByItem(itemId: string): Promise<WorkProgressSubtask[]> {
    return prisma.workProgressSubtask.findMany({
      where: { itemId },
      orderBy: { orderIndex: "asc" },
    });
  }

  findById(subtaskId: string): Promise<WorkProgressSubtask | null> {
    return prisma.workProgressSubtask.findUnique({ where: { id: subtaskId } });
  }

  async add(data: AddSubtaskData): Promise<WorkProgressSubtask> {
    let orderIndex = data.orderIndex;
    if (orderIndex === null) {
      const last = await prisma.workProgressSubtask.findFirst({
        where: { itemId: data.itemId },
        orderBy: { orderIndex: "desc" },
        select: { orderIndex: true },
      });
      orderIndex = last ? last.orderIndex + 1 : 0;
    }
    return prisma.workProgressSubtask.create({
      data: {
        itemId: data.itemId,
        title: data.title,
        assignedToId: data.assignedToId,
        orderIndex,
      },
    });
  }

  update(
    subtaskId: string,
    data: UpdateSubtaskData,
  ): Promise<WorkProgressSubtask> {
    return prisma.workProgressSubtask.update({
      where: { id: subtaskId },
      data,
    });
  }

  async delete(subtaskId: string): Promise<void> {
    await prisma.workProgressSubtask.delete({ where: { id: subtaskId } });
  }

  async reorder(
    itemId: string,
    order: ReadonlyArray<{ subtaskId: string; orderIndex: number }>,
  ): Promise<void> {
    await prisma.$transaction(
      order.map((entry) =>
        prisma.workProgressSubtask.updateMany({
          where: { id: entry.subtaskId, itemId },
          data: { orderIndex: entry.orderIndex },
        }),
      ),
    );
  }

  async isSubtaskInItem(subtaskId: string, itemId: string): Promise<boolean> {
    const row = await prisma.workProgressSubtask.findUnique({
      where: { id: subtaskId },
      select: { itemId: true },
    });
    return row?.itemId === itemId;
  }
}
