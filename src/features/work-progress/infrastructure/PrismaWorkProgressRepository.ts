import { prisma } from "@/infrastructure/prisma/client";
import type {
  WorkProgressPlan,
  WorkProgressPlanDetail,
} from "../domain/WorkProgressPlan";
import type {
  WorkProgressItem,
  WorkProgressItemPeriodMark,
} from "../domain/WorkProgressItem";
import type {
  AddItemData,
  CloneItemSeed,
  CreatePlanData,
  CreatePlanItemSeed,
  PlanSummary,
  SetMarkData,
  UpdateItemData,
  UpdatePlanData,
  WorkProgressRepository,
} from "../application/ports/WorkProgressRepository";
import type { PeriodSeed } from "../domain/policies/period-generator";
import {
  calcByCategory,
  calcOverallPercent,
} from "../domain/policies/progress-calculator";

export class PrismaWorkProgressRepository implements WorkProgressRepository {
  // ─── Plan CRUD ──────────────────────────────────────────
  async createPlanWithPeriods(
    data: CreatePlanData,
    periods: readonly PeriodSeed[],
  ): Promise<WorkProgressPlan> {
    return prisma.$transaction(async (tx) => {
      const plan = await tx.workProgressPlan.create({
        data: {
          customerId: data.customerId,
          title: data.title,
          periodType: data.periodType,
          year: data.year,
          startDate: data.startDate,
          endDate: data.endDate,
          packageName: data.packageName,
          note: data.note,
          createdById: data.createdById,
        },
      });
      if (periods.length > 0) {
        await tx.workProgressPeriod.createMany({
          data: periods.map((p) => ({
            planId: plan.id,
            seq: p.seq,
            label: p.label,
            startDate: p.startDate ?? null,
            endDate: p.endDate ?? null,
          })),
        });
      }
      return plan;
    });
  }

  async createPlanWithItems(
    data: CreatePlanData,
    periods: readonly PeriodSeed[],
    items: readonly CreatePlanItemSeed[],
  ): Promise<WorkProgressPlan> {
    return prisma.$transaction(async (tx) => {
      const plan = await tx.workProgressPlan.create({
        data: {
          customerId: data.customerId,
          title: data.title,
          periodType: data.periodType,
          year: data.year,
          startDate: data.startDate,
          endDate: data.endDate,
          packageName: data.packageName,
          note: data.note,
          createdById: data.createdById,
        },
      });
      if (periods.length > 0) {
        await tx.workProgressPeriod.createMany({
          data: periods.map((p) => ({
            planId: plan.id,
            seq: p.seq,
            label: p.label,
            startDate: p.startDate ?? null,
            endDate: p.endDate ?? null,
          })),
        });
      }
      if (items.length > 0) {
        await tx.workProgressItem.createMany({
          data: items.map((it, i) => ({
            planId: plan.id,
            categoryId: it.categoryId,
            statusId: it.statusId,
            activity: it.activity,
            description: it.description,
            duration: it.duration,
            weight: it.weight,
            orderIndex: it.orderIndex ?? i,
          })),
        });
      }
      return plan;
    });
  }

  async findItemsForClone(planId: string): Promise<CloneItemSeed[]> {
    const rows = await prisma.workProgressItem.findMany({
      where: { planId },
      orderBy: { orderIndex: "asc" },
      select: {
        categoryId: true,
        activity: true,
        description: true,
        duration: true,
        weight: true,
        orderIndex: true,
      },
    });
    return rows;
  }

  listByCustomer(
    customerId: string,
    options: { includeArchived: boolean; limit: number },
  ): Promise<WorkProgressPlan[]> {
    return prisma.workProgressPlan.findMany({
      where: {
        customerId,
        ...(options.includeArchived ? {} : { isArchived: false }),
      },
      orderBy: [{ year: "desc" }, { createdAt: "desc" }],
      take: options.limit,
    });
  }

  findById(planId: string): Promise<WorkProgressPlan | null> {
    return prisma.workProgressPlan.findUnique({ where: { id: planId } });
  }

  async findDetail(planId: string): Promise<WorkProgressPlanDetail | null> {
    const plan = await prisma.workProgressPlan.findUnique({
      where: { id: planId },
      include: {
        periods: { orderBy: { seq: "asc" } },
        items: {
          orderBy: { orderIndex: "asc" },
          include: {
            category: true,
            status: true,
            periodMarks: { include: { markType: true } },
            subtasks: { orderBy: { orderIndex: "asc" } },
            attachments: { orderBy: { createdAt: "desc" } },
            meta: { orderBy: { key: "asc" } },
          },
        },
      },
    });
    if (!plan) return null;
    return plan as unknown as WorkProgressPlanDetail;
  }

  updatePlan(planId: string, data: UpdatePlanData): Promise<WorkProgressPlan> {
    return prisma.workProgressPlan.update({ where: { id: planId }, data });
  }

  archivePlan(
    planId: string,
    isArchived: boolean,
  ): Promise<WorkProgressPlan> {
    return prisma.workProgressPlan.update({
      where: { id: planId },
      data: { isArchived },
    });
  }

  async deletePlan(planId: string): Promise<void> {
    await prisma.workProgressPlan.delete({ where: { id: planId } });
  }

  // ─── Item CRUD ──────────────────────────────────────────
  async addItem(data: AddItemData): Promise<WorkProgressItem> {
    // ถ้า client ไม่ระบุ orderIndex → ใส่ต่อท้าย
    let orderIndex = data.orderIndex;
    if (orderIndex === null) {
      const max = await prisma.workProgressItem.findFirst({
        where: { planId: data.planId },
        orderBy: { orderIndex: "desc" },
        select: { orderIndex: true },
      });
      orderIndex = max ? max.orderIndex + 1 : 0;
    }
    return prisma.workProgressItem.create({
      data: {
        planId: data.planId,
        categoryId: data.categoryId,
        statusId: data.statusId,
        activity: data.activity,
        description: data.description,
        duration: data.duration,
        note: data.note,
        weight: data.weight,
        orderIndex,
        startDate: data.startDate,
        dueDate: data.dueDate,
      },
    });
  }

  findItemById(itemId: string): Promise<WorkProgressItem | null> {
    return prisma.workProgressItem.findUnique({ where: { id: itemId } });
  }

  updateItem(itemId: string, data: UpdateItemData): Promise<WorkProgressItem> {
    return prisma.workProgressItem.update({ where: { id: itemId }, data });
  }

  assignItem(
    itemId: string,
    assignedToId: string | null,
  ): Promise<WorkProgressItem> {
    return prisma.workProgressItem.update({
      where: { id: itemId },
      data: { assignedToId },
    });
  }

  async deleteItem(itemId: string): Promise<void> {
    await prisma.workProgressItem.delete({ where: { id: itemId } });
  }

  async reorderItems(
    planId: string,
    order: ReadonlyArray<{ itemId: string; orderIndex: number }>,
  ): Promise<void> {
    await prisma.$transaction(
      order.map((entry) =>
        prisma.workProgressItem.updateMany({
          where: { id: entry.itemId, planId },
          data: { orderIndex: entry.orderIndex },
        }),
      ),
    );
  }

  // ─── Mark CRUD ──────────────────────────────────────────
  setPeriodMark(data: SetMarkData): Promise<WorkProgressItemPeriodMark> {
    return prisma.workProgressItemPeriodMark.upsert({
      where: { itemId_periodId: { itemId: data.itemId, periodId: data.periodId } },
      create: {
        itemId: data.itemId,
        periodId: data.periodId,
        markTypeId: data.markTypeId,
        progressPercent: data.progressPercent,
        note: data.note,
      },
      update: {
        markTypeId: data.markTypeId,
        progressPercent: data.progressPercent,
        note: data.note,
      },
    });
  }

  async clearPeriodMark(itemId: string, periodId: string): Promise<void> {
    await prisma.workProgressItemPeriodMark.deleteMany({
      where: { itemId, periodId },
    });
  }

  async bulkSetPeriodMarks(
    itemId: string,
    marks: ReadonlyArray<Omit<SetMarkData, "itemId">>,
  ): Promise<{ count: number }> {
    await prisma.$transaction(
      marks.map((m) =>
        prisma.workProgressItemPeriodMark.upsert({
          where: { itemId_periodId: { itemId, periodId: m.periodId } },
          create: {
            itemId,
            periodId: m.periodId,
            markTypeId: m.markTypeId,
            progressPercent: m.progressPercent,
            note: m.note,
          },
          update: {
            markTypeId: m.markTypeId,
            progressPercent: m.progressPercent,
            note: m.note,
          },
        }),
      ),
    );
    return { count: marks.length };
  }

  // ─── Cross-plan validators ──────────────────────────────
  async isPeriodInPlan(periodId: string, planId: string): Promise<boolean> {
    const period = await prisma.workProgressPeriod.findUnique({
      where: { id: periodId },
      select: { planId: true },
    });
    return period?.planId === planId;
  }

  async isItemInPlan(itemId: string, planId: string): Promise<boolean> {
    const item = await prisma.workProgressItem.findUnique({
      where: { id: itemId },
      select: { planId: true },
    });
    return item?.planId === planId;
  }

  // ─── Summary ────────────────────────────────────────────
  async getPlanSummary(planId: string): Promise<PlanSummary> {
    // ดึงเฉพาะ field ที่ใช้ — กัน payload ใหญ่ที่ plan items เยอะ
    const items = await prisma.workProgressItem.findMany({
      where: { planId },
      select: { categoryId: true, weight: true, progressPercent: true },
    });
    const overallPercent = calcOverallPercent(items);
    const byCategory = calcByCategory(items);

    // by period — group ที่ DB ด้วย groupBy (rule 04)
    const periods = await prisma.workProgressPeriod.findMany({
      where: { planId },
      orderBy: { seq: "asc" },
      select: { id: true, seq: true, label: true },
    });
    const markCounts = await prisma.workProgressItemPeriodMark.groupBy({
      by: ["periodId"],
      where: { period: { planId } },
      _count: { _all: true },
    });
    const countMap = new Map<string, number>(
      markCounts.map((m) => [m.periodId, m._count._all]),
    );

    return {
      planId,
      overallPercent,
      itemCount: items.length,
      byCategory,
      byPeriod: periods.map((p) => ({
        periodId: p.id,
        seq: p.seq,
        label: p.label,
        markCount: countMap.get(p.id) ?? 0,
      })),
    };
  }
}
