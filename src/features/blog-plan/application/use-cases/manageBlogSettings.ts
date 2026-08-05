import { BadRequestError, NotFoundError } from '@/lib/errors'
import { buildStageSchedule, getFlowStages } from '../../domain/policies/stage-schedule'
import type { BlogArticleRepository } from '../ports/BlogArticleRepository'
import type { BlogSettings, BlogSettingsRepository } from '../ports/BlogSettingsRepository'
import type { UpdateBlogSettingsInput } from '../../schemas'
import { recalculateStatus } from './recalculateStatus'

export function getBlogSettingsUseCase(settings: BlogSettingsRepository) {
  return async (customerId: string): Promise<BlogSettings> => {
    const found = await settings.get(customerId)
    if (!found) throw new NotFoundError('ไม่พบลูกค้า')
    return found
  }
}

export function updateBlogSettingsUseCase(
  settings: BlogSettingsRepository,
  articles: BlogArticleRepository,
) {
  return async (customerId: string, input: UpdateBlogSettingsInput): Promise<BlogSettings> => {
    if (input.blogWriterId) {
      const isWriter = await settings.isBlogWriter(input.blogWriterId)
      if (!isWriter) throw new BadRequestError('ผู้ใช้ที่เลือกไม่ใช่ Blog Writer')
    }

    const before = await settings.get(customerId)
    if (!before) throw new NotFoundError('ไม่พบลูกค้า')

    const updated = await settings.update(customerId, input)
    if (updated.blogRequiresApproval !== before.blogRequiresApproval) {
      await syncArticleFlows(articles, customerId, updated.blogRequiresApproval)
    }
    return updated
  }
}

/**
 * สลับโหมดตรวจงานแล้วบทความที่ยังไม่จบต้องเดินตาม flow ใหม่ทันที
 * ขั้นที่ส่งไปแล้วคงไว้เป็นประวัติ — ลบเฉพาะขั้นที่ยังไม่ได้ส่งและไม่อยู่ใน flow ใหม่
 * seq ของขั้นเดิมไม่ถูกเรียงใหม่ (ลำดับที่ใช้จริงมาจาก getArticleFlow ไม่ใช่ seq ใน DB)
 */
async function syncArticleFlows(
  articles: BlogArticleRepository,
  customerId: string,
  requiresApproval: boolean,
): Promise<void> {
  const flow = getFlowStages(requiresApproval)
  const flowCodes = new Set(flow.map((stage) => stage.code))
  const all = await articles.listByCustomer(customerId, {})

  for (const article of all) {
    if (article.status === 'PUBLISHED') continue

    const removable = article.stages
      .filter((stage) => !flowCodes.has(stage.stageCode) && !stage.submittedAt)
      .map((stage) => stage.stageCode)
    const missing = buildStageSchedule(article.startDate, flow).filter(
      (stage) => !article.stages.some((existing) => existing.stageCode === stage.stageCode),
    )
    if (removable.length === 0 && missing.length === 0) continue

    if (removable.length > 0) await articles.deleteStages(article.id, removable)
    if (missing.length > 0) await articles.addStages(article.id, missing)
    await recalculateStatus(articles, article.id, customerId)
  }
}
