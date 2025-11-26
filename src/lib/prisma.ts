import { PrismaClient } from "@prisma/client";

const globalForPrisma = global as unknown as {
  prisma: PrismaClient | undefined;
};

const prismaBase = new PrismaClient({
  log: ["query", "info", "warn", "error"],
});

// Extend Prisma Client with soft delete and history middleware
export const prisma = prismaBase.$extends({
  name: "softDeleteAndHistory",
  query: {
    user: {
      // เปลี่ยน delete เป็น update (soft delete)
      async delete({ args }) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return (prismaBase as any).user.update({
          ...args,
          data: { deletedAt: new Date() },
        });
      },
      // เปลี่ยน deleteMany เป็น updateMany (soft delete)
      async deleteMany({ args }) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return (prismaBase as any).user.updateMany({
          ...args,
          data: { deletedAt: new Date() },
        });
      },
      // กรองข้อมูลที่ถูกลบออกจาก findUnique
      async findUnique({ args, query }) {
        // เพิ่ม filter deletedAt: null
        args.where = { ...args.where, deletedAt: null };
        return query(args);
      },
      // กรองข้อมูลที่ถูกลบออกจาก findFirst
      async findFirst({ args, query }) {
        // เพิ่ม filter deletedAt: null
        if (!args.where) {
          args.where = {};
        }
        args.where = { ...args.where, deletedAt: null };
        return query(args);
      },
      // กรองข้อมูลที่ถูกลบออกจาก findMany
      async findMany({ args, query }) {
        // ตรวจสอบว่ามีการส่ง "includeDeleted: true" มาหรือไม่
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if ((args as any).includeDeleted) {
          // ลบ property นี้ออกก่อนส่งให้ Prisma ทำงานต่อ
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          delete (args as any).includeDeleted;
          // ส่ง query เดิมๆ โดยไม่เพิ่มเงื่อนไข deletedAt
          return query(args);
        }

        // Logic เดิม: ถ้าไม่มีการระบุ deletedAt ให้กรองเฉพาะข้อมูลที่ไม่ถูกลบ
        if (!args.where) {
          args.where = {};
        }
        // ถ้าไม่มีการระบุ deletedAt ให้กรองเฉพาะข้อมูลที่ไม่ถูกลบ
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if ((args.where as any).deletedAt === undefined) {
          args.where = { ...args.where, deletedAt: null };
        }
        return query(args);
      },
    },

    // --- Middleware สำหรับ OverallMetrics ---
    overallMetrics: {
      async update({ args, query }) {
        const existingMetrics = await prismaBase.overallMetrics.findUnique({
          where: args.where,
        });
        if (existingMetrics) {
          await prismaBase.overallMetricsHistory.create({
            data: {
              domainRating: existingMetrics.domainRating,
              healthScore: existingMetrics.healthScore,
              ageInYears: existingMetrics.ageInYears,
              spamScore: existingMetrics.spamScore,
              organicTraffic: existingMetrics.organicTraffic,
              organicKeywords: existingMetrics.organicKeywords,
              backlinks: existingMetrics.backlinks,
              refDomains: existingMetrics.refDomains,
              customerId: existingMetrics.customerId,
            },
          });
        }
        return query(args);
      },
      async upsert({ args, query }) {
        const existingMetrics = await prismaBase.overallMetrics.findUnique({
          where: args.where,
        });
        if (existingMetrics) {
          await prismaBase.overallMetricsHistory.create({
            data: {
              domainRating: existingMetrics.domainRating,
              healthScore: existingMetrics.healthScore,
              ageInYears: existingMetrics.ageInYears,
              ageInMonths: existingMetrics.ageInMonths,
              spamScore: existingMetrics.spamScore,
              organicTraffic: existingMetrics.organicTraffic,
              organicKeywords: existingMetrics.organicKeywords,
              backlinks: existingMetrics.backlinks,
              refDomains: existingMetrics.refDomains,
              customerId: existingMetrics.customerId,
            },
          });
        }
        return query(args);
      },
    },

    // --- Middleware สำหรับ KeywordReport ---
    keywordReport: {
      async update({ args, query }) {
        const existingKeyword = await prismaBase.keywordReport.findUnique({
          where: args.where,
        });
        if (existingKeyword) {
          await prismaBase.keywordReportHistory.create({
            data: {
              keyword: existingKeyword.keyword,
              position: existingKeyword.position,
              traffic: existingKeyword.traffic,
              kd: existingKeyword.kd,
              isTopReport: existingKeyword.isTopReport,
              reportId: existingKeyword.id,
            },
          });
        }
        return query(args);
      },
    },
  },
});

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prismaBase;

export default prisma;
