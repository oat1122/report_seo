// src/services/CustomerService.ts
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { KDLevel } from "@prisma/client";
import { BadRequestError } from "@/lib/errors";

// --- Zod Schema สำหรับ Validation ---
const metricsSchema = z.object({
  domainRating: z.coerce.number().int().min(0).max(100),
  healthScore: z.coerce.number().int().min(0).max(100),
  ageInYears: z.coerce.number().int().min(0),
  ageInMonths: z.coerce.number().int().min(0).max(11).default(0),
  spamScore: z.coerce.number().int().min(0).max(100),
  organicTraffic: z.coerce.number().int().min(0),
  organicKeywords: z.coerce.number().int().min(0),
  backlinks: z.coerce.number().int().min(0),
  refDomains: z.coerce.number().int().min(0),
});

const keywordSchema = z.object({
  keyword: z.string().min(1, "Keyword is required"),
  position: z.coerce.number().int().min(0).nullable().optional(),
  traffic: z.coerce.number().int().min(0),
  kd: z.enum(KDLevel),
  isTopReport: z.boolean(),
});

const recommendKeywordSchema = z.object({
  keyword: z.string().min(1, "Keyword is required"),
  kd: z.enum(KDLevel).nullable().optional(),
  isTopReport: z.boolean().optional(),
  note: z.string().nullable().optional(),
});

// แปลง note ที่ user ส่งมา → null (รองรับทั้ง undefined, "", "  ")
function normalizeNote(note: string | null | undefined): string | null {
  if (note == null) return null;
  const trimmed = note.trim();
  return trimmed === "" ? null : trimmed;
}

class CustomerService {
  /**
   * ดึงข้อมูล Customer Report ทั้งหมด (Metrics, Keywords, Recommendations, AI Overviews)
   */
  public async getCustomerReport(customerId: string) {
    // 1. ค้นหา Customer Profile โดยใช้ userId
    const customer = await prisma.customer.findUnique({
      where: { userId: customerId },
      include: {
        user: {
          select: { name: true },
        },
      },
    });

    if (!customer) {
      return {
        metrics: null,
        topKeywords: [],
        otherKeywords: [],
        recommendations: [],
        aiOverviews: [],
        customerName: null,
        domain: null,
      };
    }

    // 2. ดึงข้อมูลทั้งหมดพร้อมกัน
    const [metrics, keywords, recommendations, aiOverviews] = await Promise.all(
      [
        prisma.overallMetrics.findUnique({
          where: { customerId: customer.id },
        }),
        prisma.keywordReport.findMany({
          where: { customerId: customer.id },
          orderBy: [{ isTopReport: "desc" }, { position: "asc" }],
        }),
        prisma.keywordRecommend.findMany({
          where: { customerId: customer.id },
          orderBy: { createdAt: "desc" },
        }),
        prisma.aiOverview.findMany({
          where: { customerId: customer.id },
          include: { images: true },
          orderBy: { createdAt: "desc" },
        }),
      ],
    );

    // 3. แยกประเภท Keywords
    const topKeywords = keywords.filter((kw) => kw.isTopReport);
    const otherKeywords = keywords.filter((kw) => !kw.isTopReport);

    return {
      metrics,
      topKeywords,
      otherKeywords,
      recommendations,
      aiOverviews,
      customerName: customer.user.name,
      domain: customer.domain,
    };
  }

  /**
   * ดึง Overall Metrics — รับ Customer.id (internal) ตรง
   */
  public async getMetrics(customerInternalId: string) {
    return prisma.overallMetrics.findUnique({
      where: { customerId: customerInternalId },
    });
  }

  /**
   * บันทึก Overall Metrics (Create หรือ Update) — รับ Customer.id (internal) ตรง
   */
  public async saveMetrics(customerInternalId: string, data: unknown) {
    const validationResult = metricsSchema.safeParse(data);

    if (!validationResult.success) {
      throw new BadRequestError(
        `Invalid data: ${validationResult.error.issues
          .map((i) => i.message)
          .join(", ")}`,
      );
    }

    const numericData = validationResult.data;

    return prisma.overallMetrics.upsert({
      where: { customerId: customerInternalId },
      update: numericData,
      create: {
        ...numericData,
        customerId: customerInternalId,
      },
    });
  }

  /**
   * ดึง Keywords ทั้งหมด — รับ Customer.id (internal) ตรง
   */
  public async getKeywords(customerInternalId: string) {
    return prisma.keywordReport.findMany({
      where: { customerId: customerInternalId },
      orderBy: { dateRecorded: "desc" },
    });
  }

  /**
   * เพิ่ม Keyword ใหม่ — รับ Customer.id (internal) ตรง
   */
  public async addKeyword(customerInternalId: string, data: unknown) {
    const validationResult = keywordSchema.safeParse(data);
    if (!validationResult.success) {
      throw new BadRequestError(
        `Invalid data: ${validationResult.error.issues
          .map((i) => i.message)
          .join(", ")}`,
      );
    }

    const validated = validationResult.data;

    return prisma.keywordReport.create({
      data: {
        keyword: validated.keyword,
        position: validated.position ?? null,
        traffic: validated.traffic,
        kd: validated.kd,
        isTopReport: validated.isTopReport,
        customerId: customerInternalId,
      },
    });
  }

  /**
   * อัปเดต Keyword — caller ต้องตรวจ access ผ่าน getKeywordAccessContext แล้ว
   */
  public async updateKeyword(keywordId: string, data: unknown) {
    const validationResult = keywordSchema.safeParse(data);
    if (!validationResult.success) {
      throw new BadRequestError(
        `Invalid data: ${validationResult.error.issues
          .map((i) => i.message)
          .join(", ")}`,
      );
    }

    const validated = validationResult.data;

    return prisma.keywordReport.update({
      where: { id: keywordId },
      data: {
        keyword: validated.keyword,
        position: validated.position ?? null,
        traffic: validated.traffic,
        kd: validated.kd,
        isTopReport: validated.isTopReport,
      },
    });
  }

  /**
   * ลบ Keyword — caller ต้องตรวจ access แล้ว
   */
  public async deleteKeyword(keywordId: string) {
    return prisma.keywordReport.delete({
      where: { id: keywordId },
    });
  }

  /**
   * ดึง Recommend Keywords — รับ Customer.id (internal) ตรง
   */
  public async getRecommendKeywords(customerInternalId: string) {
    return prisma.keywordRecommend.findMany({
      where: { customerId: customerInternalId },
      orderBy: { createdAt: "desc" },
    });
  }

  /**
   * เพิ่ม Recommend Keyword ใหม่ — รับ Customer.id (internal) ตรง
   */
  public async addRecommendKeyword(
    customerInternalId: string,
    data: unknown,
  ) {
    const validationResult = recommendKeywordSchema.safeParse(data);
    if (!validationResult.success) {
      throw new BadRequestError(
        `Invalid data: ${validationResult.error.issues
          .map((i) => i.message)
          .join(", ")}`,
      );
    }

    const validated = validationResult.data;

    return prisma.keywordRecommend.create({
      data: {
        keyword: validated.keyword,
        note: normalizeNote(validated.note),
        kd: validated.kd ?? null,
        isTopReport: validated.isTopReport ?? false,
        customerId: customerInternalId,
      },
    });
  }

  /**
   * อัปเดต Recommend Keyword — caller ต้องตรวจ access แล้ว
   */
  public async updateRecommendKeyword(recommendId: string, data: unknown) {
    const validationResult = recommendKeywordSchema.safeParse(data);
    if (!validationResult.success) {
      throw new BadRequestError(
        `Invalid data: ${validationResult.error.issues
          .map((i) => i.message)
          .join(", ")}`,
      );
    }

    const validated = validationResult.data;

    return prisma.keywordRecommend.update({
      where: { id: recommendId },
      data: {
        keyword: validated.keyword,
        note: normalizeNote(validated.note),
        kd: validated.kd ?? null,
        isTopReport: validated.isTopReport ?? false,
      },
    });
  }

  /**
   * ลบ Recommend Keyword — caller ต้องตรวจ access แล้ว
   */
  public async deleteRecommendKeyword(recommendId: string) {
    return prisma.keywordRecommend.delete({
      where: { id: recommendId },
    });
  }
}

export const customerService = new CustomerService();
