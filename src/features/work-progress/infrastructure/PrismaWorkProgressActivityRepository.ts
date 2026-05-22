import { Prisma } from "@prisma/client";
import { prisma } from "@/infrastructure/prisma/client";
import type {
  WorkProgressActivity,
  WorkProgressActivityAction,
  WorkProgressActivityDiff,
  WorkProgressActivityEntity,
} from "../domain/WorkProgressActivity";
import type {
  ActivityListQuery,
  ActivityListResult,
  ActivityLogInput,
  WorkProgressActivityRepository,
} from "../application/ports/WorkProgressActivityRepository";

function toDomain(row: {
  id: string;
  planId: string;
  actorId: string | null;
  action: string;
  entity: string;
  entityId: string | null;
  diff: Prisma.JsonValue | null;
  createdAt: Date;
}): WorkProgressActivity {
  return {
    id: row.id,
    planId: row.planId,
    actorId: row.actorId,
    action: row.action as WorkProgressActivityAction,
    entity: row.entity as WorkProgressActivityEntity,
    entityId: row.entityId,
    diff: (row.diff as WorkProgressActivityDiff | null) ?? null,
    createdAt: row.createdAt,
  };
}

export class PrismaWorkProgressActivityRepository
  implements WorkProgressActivityRepository
{
  async log(input: ActivityLogInput): Promise<void> {
    await prisma.workProgressActivity.create({
      data: {
        planId: input.planId,
        actorId: input.actorId,
        action: input.action,
        entity: input.entity,
        entityId: input.entityId ?? null,
        diff:
          input.diff == null
            ? Prisma.JsonNull
            : (input.diff as Prisma.InputJsonValue),
      },
    });
  }

  async list(query: ActivityListQuery): Promise<ActivityListResult> {
    const rows = await prisma.workProgressActivity.findMany({
      where: {
        planId: query.planId,
        ...(query.entity ? { entity: query.entity } : {}),
        ...(query.action ? { action: query.action } : {}),
      },
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      take: query.limit + 1,
      cursor: query.cursor ? { id: query.cursor } : undefined,
      skip: query.cursor ? 1 : 0,
    });

    let nextCursor: string | null = null;
    let items = rows;
    if (rows.length > query.limit) {
      const trimmed = rows.slice(0, query.limit);
      nextCursor = trimmed[trimmed.length - 1]?.id ?? null;
      items = trimmed;
    }

    return { items: items.map(toDomain), nextCursor };
  }

  async listRecentForCustomer(
    customerId: string,
    limit: number,
  ): Promise<WorkProgressActivity[]> {
    const rows = await prisma.workProgressActivity.findMany({
      where: { plan: { customerId } },
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      take: limit,
    });
    return rows.map(toDomain);
  }
}
