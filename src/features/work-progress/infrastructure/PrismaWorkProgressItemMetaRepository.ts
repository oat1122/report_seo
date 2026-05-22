import { prisma } from "@/infrastructure/prisma/client";
import type {
  MetaValueType,
  WorkProgressItemMeta,
} from "../domain/WorkProgressItemMeta";
import type {
  UpsertMetaData,
  WorkProgressItemMetaRepository,
} from "../application/ports/WorkProgressItemMetaRepository";

function toDomain(row: {
  id: string;
  itemId: string;
  key: string;
  value: string;
  valueType: string;
  createdAt: Date;
  updatedAt: Date;
}): WorkProgressItemMeta {
  return {
    id: row.id,
    itemId: row.itemId,
    key: row.key,
    value: row.value,
    valueType: row.valueType as MetaValueType,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export class PrismaWorkProgressItemMetaRepository
  implements WorkProgressItemMetaRepository
{
  async listByItem(itemId: string): Promise<WorkProgressItemMeta[]> {
    const rows = await prisma.workProgressItemMeta.findMany({
      where: { itemId },
      orderBy: { key: "asc" },
    });
    return rows.map(toDomain);
  }

  async upsert(data: UpsertMetaData): Promise<WorkProgressItemMeta> {
    const row = await prisma.workProgressItemMeta.upsert({
      where: { itemId_key: { itemId: data.itemId, key: data.key } },
      create: {
        itemId: data.itemId,
        key: data.key,
        value: data.value,
        valueType: data.valueType,
      },
      update: { value: data.value, valueType: data.valueType },
    });
    return toDomain(row);
  }

  async upsertMany(
    itemId: string,
    entries: ReadonlyArray<Omit<UpsertMetaData, "itemId">>,
  ): Promise<WorkProgressItemMeta[]> {
    const rows = await prisma.$transaction(
      entries.map((e) =>
        prisma.workProgressItemMeta.upsert({
          where: { itemId_key: { itemId, key: e.key } },
          create: {
            itemId,
            key: e.key,
            value: e.value,
            valueType: e.valueType,
          },
          update: { value: e.value, valueType: e.valueType },
        }),
      ),
    );
    return rows.map(toDomain);
  }

  async delete(itemId: string, key: string): Promise<void> {
    await prisma.workProgressItemMeta.deleteMany({ where: { itemId, key } });
  }
}
