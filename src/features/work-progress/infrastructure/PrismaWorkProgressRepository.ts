import { Prisma } from "@prisma/client";
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
  CategoryBreakdownRow,
  CloneItemSeed,
  CreatePlanData,
  CreatePlanItemSeed,
  CustomerSummary,
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

  // ─── Phase 4 — Customer-wide summary ────────────────────
  async summarizeCustomer(
    customerId: string,
    options: { upcomingDays: number },
  ): Promise<CustomerSummary> {
    const now = new Date();
    const upcomingEnd = new Date(now);
    upcomingEnd.setDate(upcomingEnd.getDate() + options.upcomingDays);

    // 1) plan counts (active vs archived)
    const planCounts = await prisma.workProgressPlan.groupBy({
      by: ["isArchived"],
      where: { customerId },
      _count: { _all: true },
    });
    let activePlanCount = 0;
    let archivedPlanCount = 0;
    for (const row of planCounts) {
      if (row.isArchived) archivedPlanCount = row._count._all;
      else activePlanCount = row._count._all;
    }

    // 2) item aggregate (avg progress + total count) — เฉพาะ active plan
    const itemAgg = await prisma.workProgressItem.aggregate({
      where: { plan: { customerId, isArchived: false } },
      _count: { _all: true },
      _avg: { progressPercent: true },
    });
    const totalItems = itemAgg._count._all;
    const avgProgressPercent = Math.round(itemAgg._avg.progressPercent ?? 0);

    // 3) upcoming & overdue — Prisma count (ห้าม fetch แล้วนับใน JS, rule 04)
    const [upcomingDueCount, overdueCount] = await Promise.all([
      prisma.workProgressItem.count({
        where: {
          plan: { customerId, isArchived: false },
          completedAt: null,
          dueDate: { gte: now, lte: upcomingEnd },
        },
      }),
      prisma.workProgressItem.count({
        where: {
          plan: { customerId, isArchived: false },
          completedAt: null,
          dueDate: { lt: now },
        },
      }),
    ]);

    return {
      activePlanCount,
      archivedPlanCount,
      totalItems,
      avgProgressPercent,
      upcomingDueCount,
      overdueCount,
    };
  }

  // ─── Phase 4 — Category × markType breakdown ────────────
  // ใช้ Prisma groupBy ทั้งหมด ห้ามดึง list แล้ว reduce ใน JS (rule 04)
  async getCategoryBreakdown(
    planId: string,
    options: { categoryId?: string },
  ): Promise<CategoryBreakdownRow[]> {
    // groupBy ผ่าน relation: ใช้ where { item: { planId, categoryId } }
    // by: ['markTypeId'] ตรง ๆ ไม่ได้ครอบ category — ต้องใช้ SQL join → Prisma รองรับผ่าน
    // groupBy ที่ field ของ relation ไม่ได้ ใช้ raw approach: query แบบ aggregate ต่อ category
    // วิธีที่ทำได้ใน Prisma: ดึง categoryId ของ item แต่ละ mark ผ่าน 2 query แล้ว combine
    //
    // 1) ดึง mapping item → category (item-level groupBy)
    // 2) groupBy(markType, item.categoryId) จำลองด้วย: groupBy markType ต่อ category
    //
    // ทำให้สั้น+ตรง spec: groupBy บน markType (ทั่ว plan) + groupBy บน markType+categoryId ผ่าน
    // findMany select ที่ DB-side (Prisma ไม่ให้ groupBy ข้าม relation field ใน v5) — แต่
    // กัน rule 04 (ห้าม aggregate ใน JS) ใช้ $queryRaw แบบ tagged template (rule 01: ห้ามใช้
    // queryRawUnsafe กับ user input — planId/categoryId เป็น UUID ที่ผ่าน Zod แล้ว ปลอดภัย)
    const rows = options.categoryId
      ? await prisma.$queryRaw<
          Array<{
            categoryId: string;
            markTypeId: string;
            count: bigint;
            sumProgress: bigint | null;
          }>
        >(Prisma.sql`
          SELECT
            i.categoryId       AS categoryId,
            m.markTypeId       AS markTypeId,
            COUNT(*)           AS count,
            COALESCE(SUM(m.progressPercent), 0) AS sumProgress
          FROM workprogressitemperiodmark m
          JOIN workprogressitem i ON i.id = m.itemId
          WHERE i.planId = ${planId} AND i.categoryId = ${options.categoryId}
          GROUP BY i.categoryId, m.markTypeId
        `)
      : await prisma.$queryRaw<
          Array<{
            categoryId: string;
            markTypeId: string;
            count: bigint;
            sumProgress: bigint | null;
          }>
        >(Prisma.sql`
          SELECT
            i.categoryId       AS categoryId,
            m.markTypeId       AS markTypeId,
            COUNT(*)           AS count,
            COALESCE(SUM(m.progressPercent), 0) AS sumProgress
          FROM workprogressitemperiodmark m
          JOIN workprogressitem i ON i.id = m.itemId
          WHERE i.planId = ${planId}
          GROUP BY i.categoryId, m.markTypeId
        `);

    return rows.map((r) => ({
      categoryId: r.categoryId,
      markTypeId: r.markTypeId,
      count: Number(r.count),
      sumProgress: Number(r.sumProgress ?? 0),
    }));
  }
}
