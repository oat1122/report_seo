// src/services/CustomerService.ts
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { KDLevel } from "@prisma/client";

// --- Zod Schema สำหรับ Validation ---
const metricsSchema = z.object({
  domainRating: z.coerce.number().int().min(0).max(100),
  healthScore: z.coerce.number().int().min(0).max(100),
  ageInYears: z.coerce.number().int().min(0),
  spamScore: z.coerce.number().int().min(0).max(100),
  organicTraffic: z.coerce.number().int().min(0),
  organicKeywords: z.coerce.number().int().min(0),
  backlinks: z.coerce.number().int().min(0),
  refDomains: z.coerce.number().int().min(0),
});

const keywordSchema = z.object({
  keyword: z.string().min(1, "Keyword is required"),
  position: z.union([z.number().int().min(1), z.string(), z.null()]).optional(),
  traffic: z.union([z.number().int().min(0), z.string()]),
  kd: z.nativeEnum(KDLevel), // Required field
  isTopReport: z.boolean(),
});

const recommendKeywordSchema = z.object({
  keyword: z.string().min(1, "Keyword is required"),
  kd: z.nativeEnum(KDLevel).nullable().optional(),
  isTopReport: z.boolean().optional(),
  note: z.string().optional(),
});

class CustomerService {
  /**
   * ดึงข้อมูล Customer Report ทั้งหมด (Metrics, Keywords, Recommendations)
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
        customerName: null,
        domain: null,
      };
    }

    // 2. ดึงข้อมูล Metrics, Keywords และ Recommendations พร้อมกัน
    const [metrics, keywords, recommendations] = await Promise.all([
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
    ]);

    // 3. แยกประเภท Keywords
    const topKeywords = keywords.filter((kw) => kw.isTopReport);
    const otherKeywords = keywords.filter((kw) => !kw.isTopReport);

    return {
      metrics,
      topKeywords,
      otherKeywords,
      recommendations,
      customerName: customer.user.name,
      domain: customer.domain,
    };
  }

  /**
   * ดึงข้อมูล Overall Metrics ของลูกค้า
   */
  public async getMetrics(customerId: string) {
    const customer = await prisma.customer.findUnique({
      where: { userId: customerId },
    });

    if (!customer) {
      return null;
    }

    return prisma.overallMetrics.findUnique({
      where: { customerId: customer.id },
    });
  }

  /**
   * บันทึก Overall Metrics (Create หรือ Update)
   */
  public async saveMetrics(customerId: string, data: unknown) {
    // หา Customer profile จาก User ID
    const customer = await prisma.customer.findUnique({
      where: { userId: customerId },
    });

    if (!customer) {
      throw new Error("Customer not found");
    }

    // Validate ข้อมูลด้วย Zod
    const validationResult = metricsSchema.safeParse(data);

    if (!validationResult.success) {
      throw new Error(
        `Invalid data: ${validationResult.error.issues
          .map((i) => i.message)
          .join(", ")}`
      );
    }

    // ข้อมูลที่ผ่านการ validate และแปลง type แล้ว
    const numericData = validationResult.data;

    // Upsert (Middleware การสร้าง History จะทำงานอัตโนมัติ)
    return prisma.overallMetrics.upsert({
      where: { customerId: customer.id },
      update: numericData,
      create: {
        ...numericData,
        customerId: customer.id,
      },
    });
  }

  /**
   * ดึง Keywords ทั้งหมดของลูกค้า
   */
  public async getKeywords(customerId: string) {
    const customer = await prisma.customer.findUnique({
      where: { userId: customerId },
    });

    if (!customer) {
      return [];
    }

    return prisma.keywordReport.findMany({
      where: { customerId: customer.id },
      orderBy: { dateRecorded: "desc" },
    });
  }

  /**
   * เพิ่ม Keyword ใหม่
   */
  public async addKeyword(customerId: string, data: unknown) {
    const customer = await prisma.customer.findUnique({
      where: { userId: customerId },
    });

    if (!customer) {
      throw new Error("Customer not found");
    }

    // Validate
    const validationResult = keywordSchema.safeParse(data);
    if (!validationResult.success) {
      throw new Error(
        `Invalid data: ${validationResult.error.issues
          .map((i) => i.message)
          .join(", ")}`
      );
    }

    const validated = validationResult.data;

    return prisma.keywordReport.create({
      data: {
        keyword: validated.keyword,
        position: validated.position
          ? typeof validated.position === "string"
            ? parseInt(validated.position, 10)
            : validated.position
          : null,
        traffic:
          typeof validated.traffic === "string"
            ? parseInt(validated.traffic, 10)
            : validated.traffic,
        kd: validated.kd,
        isTopReport: validated.isTopReport,
        customerId: customer.id,
      },
    });
  }

  /**
   * อัปเดต Keyword (ต้องตรวจสอบว่าเป็นของ customer นี้)
   */
  public async updateKeyword(
    keywordId: string,
    customerId: string,
    data: unknown
  ) {
    // ตรวจสอบว่า keyword นี้เป็นของ customer หรือไม่
    const existingKeyword = await prisma.keywordReport.findUnique({
      where: { id: keywordId },
      include: {
        customer: {
          select: { userId: true },
        },
      },
    });

    if (!existingKeyword) {
      throw new Error("Keyword not found");
    }

    if (existingKeyword.customer.userId !== customerId) {
      throw new Error("Forbidden: This keyword does not belong to you");
    }

    // Validate
    const validationResult = keywordSchema.safeParse(data);
    if (!validationResult.success) {
      throw new Error(
        `Invalid data: ${validationResult.error.issues
          .map((i) => i.message)
          .join(", ")}`
      );
    }

    const validated = validationResult.data;

    return prisma.keywordReport.update({
      where: { id: keywordId },
      data: {
        keyword: validated.keyword,
        position: validated.position
          ? typeof validated.position === "string"
            ? parseInt(validated.position, 10)
            : validated.position
          : null,
        traffic:
          typeof validated.traffic === "string"
            ? parseInt(validated.traffic, 10)
            : validated.traffic,
        kd: validated.kd,
        isTopReport: validated.isTopReport,
      },
    });
  }

  /**
   * ลบ Keyword
   */
  public async deleteKeyword(keywordId: string, customerId: string) {
    // ตรวจสอบว่า keyword นี้เป็นของ customer หรือไม่
    const existingKeyword = await prisma.keywordReport.findUnique({
      where: { id: keywordId },
      include: {
        customer: {
          select: { userId: true },
        },
      },
    });

    if (!existingKeyword) {
      throw new Error("Keyword not found");
    }

    if (existingKeyword.customer.userId !== customerId) {
      throw new Error("Forbidden: This keyword does not belong to you");
    }

    return prisma.keywordReport.delete({
      where: { id: keywordId },
    });
  }

  /**
   * ดึง Recommend Keywords
   */
  public async getRecommendKeywords(customerId: string) {
    const customer = await prisma.customer.findUnique({
      where: { userId: customerId },
    });

    if (!customer) {
      throw new Error("Customer not found");
    }

    return prisma.keywordRecommend.findMany({
      where: { customerId: customer.id },
      orderBy: { createdAt: "desc" },
    });
  }

  /**
   * เพิ่ม Recommend Keyword ใหม่
   */
  public async addRecommendKeyword(customerId: string, data: unknown) {
    const customer = await prisma.customer.findUnique({
      where: { userId: customerId },
    });

    if (!customer) {
      throw new Error("Customer not found");
    }

    // Validate
    const validationResult = recommendKeywordSchema.safeParse(data);
    if (!validationResult.success) {
      throw new Error(
        `Invalid data: ${validationResult.error.issues
          .map((i) => i.message)
          .join(", ")}`
      );
    }

    const validated = validationResult.data;

    return prisma.keywordRecommend.create({
      data: {
        keyword: validated.keyword,
        note: validated.note,
        kd: validated.kd || null,
        isTopReport: validated.isTopReport || false,
        customerId: customer.id,
      },
    });
  }

  /**
   * ลบ Recommend Keyword
   */
  public async deleteRecommendKeyword(recommendId: string, customerId: string) {
    // ตรวจสอบว่า recommend keyword นี้เป็นของ customer หรือไม่
    const existingRecommend = await prisma.keywordRecommend.findUnique({
      where: { id: recommendId },
      include: {
        customer: {
          select: { userId: true },
        },
      },
    });

    if (!existingRecommend) {
      throw new Error("Recommend keyword not found");
    }

    if (existingRecommend.customer.userId !== customerId) {
      throw new Error(
        "Forbidden: This recommend keyword does not belong to you"
      );
    }

    return prisma.keywordRecommend.delete({
      where: { id: recommendId },
    });
  }
}

export const customerService = new CustomerService();
