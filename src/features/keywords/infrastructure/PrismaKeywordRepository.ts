// ต้องใช้ extended prisma (`@/infrastructure/prisma/client`) เท่านั้น
// เพื่อให้ middleware ใน client.ts สร้าง KeywordReportHistory snapshot อัตโนมัติ
// ตอน update — ห้ามใช้ prismaBase ที่นี่ (จะ silently skip history)
import { prisma } from "@/infrastructure/prisma/client";
import type {
  KeywordReport,
  KeywordHistoryEntry,
} from "../domain/KeywordReport";
import type { KeywordRepository } from "../application/ports/KeywordRepository";
import type { KeywordInput } from "../schemas";

export class PrismaKeywordRepository implements KeywordRepository {
  async findByCustomerId(
    customerInternalId: string,
  ): Promise<KeywordReport[]> {
    return prisma.keywordReport.findMany({
      where: { customerId: customerInternalId },
      orderBy: { dateRecorded: "desc" },
    });
  }

  async create(
    customerInternalId: string,
    data: KeywordInput,
  ): Promise<KeywordReport> {
    return prisma.keywordReport.create({
      data: {
        keyword: data.keyword,
        position: data.position ?? null,
        traffic: data.traffic,
        kd: data.kd,
        isTopReport: data.isTopReport,
        customerId: customerInternalId,
      },
    });
  }

  async update(
    keywordId: string,
    data: KeywordInput,
  ): Promise<KeywordReport> {
    return prisma.keywordReport.update({
      where: { id: keywordId },
      data: {
        keyword: data.keyword,
        position: data.position ?? null,
        traffic: data.traffic,
        kd: data.kd,
        isTopReport: data.isTopReport,
      },
    });
  }

  async delete(keywordId: string): Promise<void> {
    await prisma.keywordReport.delete({ where: { id: keywordId } });
  }

  async findHistoryByKeywordId(
    keywordId: string,
    options: { onlyVisible: boolean },
  ): Promise<KeywordHistoryEntry[]> {
    return prisma.keywordReportHistory.findMany({
      where: {
        reportId: keywordId,
        ...(options.onlyVisible ? { isVisible: true } : {}),
      },
      orderBy: { dateRecorded: "desc" },
    });
  }

  async findHistoryByCustomerId(
    customerInternalId: string,
    options: { onlyVisible: boolean },
  ): Promise<KeywordHistoryEntry[]> {
    return prisma.keywordReportHistory.findMany({
      where: {
        report: { customerId: customerInternalId },
        ...(options.onlyVisible ? { isVisible: true } : {}),
      },
      orderBy: { dateRecorded: "desc" },
    });
  }

  async setHistoryVisibility(
    historyId: string,
    isVisible: boolean,
    customerInternalId: string,
  ): Promise<{ updated: number }> {
    const result = await prisma.keywordReportHistory.updateMany({
      where: {
        id: historyId,
        report: { customerId: customerInternalId },
      },
      data: { isVisible },
    });
    return { updated: result.count };
  }

  async setHistoryVisibilityBulk(
    historyIds: string[],
    isVisible: boolean,
    customerInternalId: string,
  ): Promise<{ updated: number }> {
    const result = await prisma.keywordReportHistory.updateMany({
      where: {
        id: { in: historyIds },
        report: { customerId: customerInternalId },
      },
      data: { isVisible },
    });
    return { updated: result.count };
  }
}
