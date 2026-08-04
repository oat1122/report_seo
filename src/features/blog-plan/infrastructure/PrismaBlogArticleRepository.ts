import type { Prisma } from '@prisma/client'
import { prisma } from '@/infrastructure/prisma/client'
import type { BlogArticle, BlogFileKind } from '../domain/BlogArticle'
import type {
  BlogArticleRepository,
  CreateArticleData,
  NewArticleFile,
  NewFeedback,
  NewSubmission,
  StagePatch,
  UpdateArticleData,
} from '../application/ports/BlogArticleRepository'
import type { BlogArticleStatus, BlogKeywordSource, BlogStageCode } from '../domain/BlogArticle'

const fileInclude = {
  uploadedBy: { select: { name: true } },
} satisfies Prisma.BlogArticleFileInclude

const articleInclude = {
  createdBy: { select: { name: true } },
  keywords: { orderBy: { keyword: 'asc' } },
  stages: { orderBy: { seq: 'asc' } },
  files: {
    where: { submissionId: null },
    orderBy: [{ kind: 'asc' }, { version: 'desc' }],
    include: fileInclude,
  },
  submissions: {
    orderBy: { createdAt: 'asc' },
    include: {
      author: { select: { name: true } },
      files: { orderBy: { createdAt: 'asc' }, include: fileInclude },
    },
  },
  feedbacks: {
    orderBy: { createdAt: 'desc' },
    include: { author: { select: { name: true } } },
  },
} satisfies Prisma.BlogArticleInclude

type PrismaArticle = Prisma.BlogArticleGetPayload<{ include: typeof articleInclude }>
type PrismaFile = Prisma.BlogArticleFileGetPayload<{ include: typeof fileInclude }>

function toFile(row: PrismaFile) {
  return {
    id: row.id,
    kind: row.kind as BlogFileKind,
    url: row.url,
    filename: row.filename,
    mimeType: row.mimeType,
    sizeBytes: row.sizeBytes,
    version: row.version,
    createdAt: row.createdAt,
    uploadedByName: row.uploadedBy?.name ?? null,
  }
}

function toDomain(row: PrismaArticle): BlogArticle {
  return {
    id: row.id,
    customerId: row.customerId,
    title: row.title,
    keyFocus: row.keyFocus,
    targetYear: row.targetYear,
    targetMonth: row.targetMonth,
    status: row.status as BlogArticleStatus,
    orderIndex: row.orderIndex,
    startDate: row.startDate,
    publishedUrl: row.publishedUrl,
    note: row.note,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    createdByName: row.createdBy?.name ?? null,
    keywords: row.keywords.map((k) => ({
      id: k.id,
      keyword: k.keyword,
      source: k.source as BlogKeywordSource,
      sourceId: k.sourceId,
    })),
    stages: row.stages.map((s) => ({
      id: s.id,
      stageCode: s.stageCode as BlogStageCode,
      seq: s.seq,
      dueDate: s.dueDate,
      submittedAt: s.submittedAt,
      note: s.note,
    })),
    legacyFiles: row.files.map(toFile),
    submissions: row.submissions.map((s) => ({
      id: s.id,
      stageCode: s.stageCode as BlogStageCode,
      round: s.round,
      message: s.message,
      linkUrl: s.linkUrl,
      createdAt: s.createdAt,
      authorName: s.author?.name ?? null,
      files: s.files.map(toFile),
    })),
    feedbacks: row.feedbacks.map((fb) => ({
      id: fb.id,
      stageCode: fb.stageCode as BlogStageCode,
      decision: fb.decision,
      comment: fb.comment,
      createdAt: fb.createdAt,
      authorName: fb.author?.name ?? null,
    })),
  }
}

export class PrismaBlogArticleRepository implements BlogArticleRepository {
  async listByCustomer(
    customerId: string,
    filter: { year?: number; month?: number },
  ): Promise<BlogArticle[]> {
    const rows = await prisma.blogArticle.findMany({
      where: {
        customerId,
        ...(filter.year ? { targetYear: filter.year } : {}),
        ...(filter.month ? { targetMonth: filter.month } : {}),
      },
      include: articleInclude,
      orderBy: [{ targetYear: 'desc' }, { targetMonth: 'desc' }, { orderIndex: 'asc' }],
    })
    return rows.map(toDomain)
  }

  async findByIdForCustomer(articleId: string, customerId: string): Promise<BlogArticle | null> {
    const row = await prisma.blogArticle.findFirst({
      where: { id: articleId, customerId },
      include: articleInclude,
    })
    return row ? toDomain(row) : null
  }

  async countByMonth(customerId: string, year: number, month: number): Promise<number> {
    return prisma.blogArticle.count({
      where: { customerId, targetYear: year, targetMonth: month },
    })
  }

  async countArticlesPerKeyword(customerId: string): Promise<Map<string, number>> {
    const rows = await prisma.blogArticleKeyword.findMany({
      where: { article: { customerId } },
      select: { keyword: true, articleId: true },
    })

    const perKeyword = new Map<string, Set<string>>()
    for (const row of rows) {
      const key = row.keyword.toLowerCase()
      const bucket = perKeyword.get(key) ?? new Set<string>()
      bucket.add(row.articleId)
      perKeyword.set(key, bucket)
    }
    return new Map([...perKeyword].map(([key, articleIds]) => [key, articleIds.size]))
  }

  async create(data: CreateArticleData): Promise<BlogArticle> {
    const row = await prisma.blogArticle.create({
      data: {
        customerId: data.customerId,
        title: data.title,
        keyFocus: data.keyFocus,
        targetYear: data.targetYear,
        targetMonth: data.targetMonth,
        startDate: data.startDate,
        note: data.note,
        createdById: data.createdById,
        stages: {
          create: data.stages.map((stage) => ({
            stageCode: stage.stageCode,
            seq: stage.seq,
            dueDate: stage.dueDate,
          })),
        },
        keywords: {
          create: data.keywords.map((keyword) => ({
            keyword: keyword.keyword,
            source: keyword.source,
            sourceId: keyword.sourceId,
          })),
        },
      },
      include: articleInclude,
    })
    return toDomain(row)
  }

  async update(articleId: string, data: UpdateArticleData): Promise<void> {
    await prisma.blogArticle.update({ where: { id: articleId }, data })
  }

  async delete(articleId: string): Promise<void> {
    await prisma.blogArticle.delete({ where: { id: articleId } })
  }

  async replaceKeywords(
    articleId: string,
    keywords: { keyword: string; source: BlogKeywordSource; sourceId: string | null }[],
  ): Promise<void> {
    await prisma.$transaction([
      prisma.blogArticleKeyword.deleteMany({ where: { articleId } }),
      prisma.blogArticleKeyword.createMany({
        data: keywords.map((keyword) => ({ ...keyword, articleId })),
      }),
    ])
  }

  async patchStage(articleId: string, stageCode: BlogStageCode, patch: StagePatch): Promise<void> {
    await prisma.blogArticleStage.update({
      where: { articleId_stageCode: { articleId, stageCode } },
      data: patch,
    })
  }

  async setStatus(articleId: string, status: BlogArticleStatus): Promise<void> {
    await prisma.blogArticle.update({ where: { id: articleId }, data: { status } })
  }

  async addSubmission(
    articleId: string,
    submission: NewSubmission,
  ): Promise<{ id: string; round: number }> {
    const round =
      (await prisma.blogArticleSubmission.count({
        where: { articleId, stageCode: submission.stageCode },
      })) + 1
    const row = await prisma.blogArticleSubmission.create({
      data: { ...submission, articleId, round },
      select: { id: true },
    })
    return { id: row.id, round }
  }

  async deleteSubmission(submissionId: string): Promise<void> {
    await prisma.blogArticleSubmission.delete({ where: { id: submissionId } })
  }

  async addFile(articleId: string, file: NewArticleFile): Promise<number> {
    const version =
      (await prisma.blogArticleFile.count({
        where: { articleId, kind: file.kind },
      })) + 1
    await prisma.blogArticleFile.create({ data: { ...file, articleId, version } })
    return version
  }

  async findFile(
    fileId: string,
    articleId: string,
  ): Promise<{ id: string; url: string; kind: BlogFileKind } | null> {
    const file = await prisma.blogArticleFile.findFirst({
      where: { id: fileId, articleId },
      select: { id: true, url: true, kind: true },
    })
    return file ? { ...file, kind: file.kind as BlogFileKind } : null
  }

  async deleteFile(fileId: string): Promise<void> {
    await prisma.blogArticleFile.delete({ where: { id: fileId } })
  }

  async addFeedback(articleId: string, feedback: NewFeedback): Promise<void> {
    await prisma.blogArticleFeedback.create({ data: { ...feedback, articleId } })
  }
}
