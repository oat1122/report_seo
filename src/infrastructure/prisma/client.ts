import { PrismaClient } from '@prisma/client'

const globalForPrisma = global as unknown as {
  prisma: PrismaClient | undefined
}

// reuse instance เดิมจาก global ใน dev — กัน HMR สร้าง PrismaClient ใหม่ทุก reload
// จน connection pool รั่วสะสมจนชน MySQL max_connections (ERROR 1040 Too many connections)
export const prismaBase =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'production' ? ['error'] : ['query', 'info', 'warn', 'error'],
  })

// Extend Prisma Client with soft delete and history middleware
export const prisma = prismaBase.$extends({
  name: 'softDeleteAndHistory',
  query: {
    user: {
      // เปลี่ยน delete เป็น update (soft delete)
      async delete({ args }) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return (prismaBase as any).user.update({
          ...args,
          data: { deletedAt: new Date() },
        })
      },
      // เปลี่ยน deleteMany เป็น updateMany (soft delete)
      async deleteMany({ args }) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return (prismaBase as any).user.updateMany({
          ...args,
          data: { deletedAt: new Date() },
        })
      },
      async findUnique({ args, query }) {
        args.where = { ...args.where, deletedAt: null }
        return query(args)
      },
      async findFirst({ args, query }) {
        if (!args.where) {
          args.where = {}
        }
        args.where = { ...args.where, deletedAt: null }
        return query(args)
      },
      async findMany({ args, query }) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if ((args as any).includeDeleted) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          delete (args as any).includeDeleted
          return query(args)
        }

        if (!args.where) {
          args.where = {}
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if ((args.where as any).deletedAt === undefined) {
          args.where = { ...args.where, deletedAt: null }
        }
        return query(args)
      },
    },

    // --- Middleware สำหรับ OverallMetrics (history snapshot) ---
    // history.create + update อยู่ใน $transaction เดียวกัน — กัน history row ผีตอน update fail
    // dateRecorded ใน history ใช้ default now() = เวลาทำ snapshot (เวลาที่ค่าเดิมหมดอายุ)
    // ห้าม copy จาก existingMetrics.dateRecorded — จะทำให้ snapshot หลายครั้งในวันเดียวกัน
    // มี dateRecorded เท่ากันหมด กราฟ trend collapse เป็น point เดียว
    overallMetrics: {
      async update({ args }) {
        return prismaBase.$transaction(async (tx) => {
          const existingMetrics = await tx.overallMetrics.findUnique({
            where: args.where,
          })
          if (existingMetrics) {
            await tx.overallMetricsHistory.create({
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
            })
          }
          return tx.overallMetrics.update(args)
        })
      },
      async upsert({ args }) {
        return prismaBase.$transaction(async (tx) => {
          const existingMetrics = await tx.overallMetrics.findUnique({
            where: args.where,
          })
          if (existingMetrics) {
            await tx.overallMetricsHistory.create({
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
            })
          }
          return tx.overallMetrics.upsert(args)
        })
      },
    },

    // --- Middleware สำหรับ KeywordReport (history snapshot) ---
    keywordReport: {
      async update({ args }) {
        return prismaBase.$transaction(async (tx) => {
          const existingKeyword = await tx.keywordReport.findUnique({
            where: args.where,
          })
          if (existingKeyword) {
            await tx.keywordReportHistory.create({
              data: {
                keyword: existingKeyword.keyword,
                position: existingKeyword.position,
                traffic: existingKeyword.traffic,
                kd: existingKeyword.kd,
                isTopReport: existingKeyword.isTopReport,
                reportId: existingKeyword.id,
              },
            })
          }
          return tx.keywordReport.update(args)
        })
      },
    },
  },
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prismaBase

export default prisma
