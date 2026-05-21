import { PrismaClient } from "@prisma/client";

const globalForPrisma = global as unknown as {
  prisma: PrismaClient | undefined;
};

export const prismaBase = new PrismaClient({
  log:
    process.env.NODE_ENV === "production"
      ? ["error"]
      : ["query", "info", "warn", "error"],
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
      async findUnique({ args, query }) {
        args.where = { ...args.where, deletedAt: null };
        return query(args);
      },
      async findFirst({ args, query }) {
        if (!args.where) {
          args.where = {};
        }
        args.where = { ...args.where, deletedAt: null };
        return query(args);
      },
      async findMany({ args, query }) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if ((args as any).includeDeleted) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          delete (args as any).includeDeleted;
          return query(args);
        }

        if (!args.where) {
          args.where = {};
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if ((args.where as any).deletedAt === undefined) {
          args.where = { ...args.where, deletedAt: null };
        }
        return query(args);
      },
    },

    // --- Middleware สำหรับ OverallMetrics (history snapshot) ---
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

    // --- Middleware สำหรับ KeywordReport (history snapshot) ---
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
