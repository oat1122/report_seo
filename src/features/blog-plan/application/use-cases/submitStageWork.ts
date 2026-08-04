import { BadRequestError, NotFoundError } from '@/lib/errors'
import type { BlogArticleStatus, BlogStageCode } from '../../domain/BlogArticle'
import { getStageDefinition } from '../../domain/policies/stage-schedule'
import type { BlogArticleRepository } from '../ports/BlogArticleRepository'
import type { BlogFileStorage } from '../ports/BlogFileStorage'
import type { SubmitStageWorkInput } from '../../schemas'
import { recalculateStatus } from './recalculateStatus'

export interface SubmitStageWorkResult {
  status: BlogArticleStatus
  stageCode: BlogStageCode
  round: number
}

/**
 * ทีมเขียนส่งงานให้ลูกค้า 1 รอบ — สร้าง submission (ข้อความ/ลิงก์/ไฟล์) แล้วค่อยปิด stage
 * ส่งซ้ำใน stage เดิมได้เรื่อย ๆ หลังลูกค้าขอแก้ (submitClientFeedback เป็นคนปลด submittedAt)
 */
export function submitStageWorkUseCase(articles: BlogArticleRepository, storage: BlogFileStorage) {
  return async (
    articleId: string,
    customerId: string,
    stageCode: BlogStageCode,
    input: SubmitStageWorkInput,
    file: File | null,
    authorId: string | null,
  ): Promise<SubmitStageWorkResult> => {
    const article = await articles.findByIdForCustomer(articleId, customerId)
    if (!article) throw new NotFoundError('ไม่พบบทความ')

    const definition = getStageDefinition(stageCode)
    if (definition.actor !== 'WRITER') {
      throw new BadRequestError('ขั้นตอนนี้ต้องให้ลูกค้าเป็นผู้ตอบ')
    }
    if (file && !definition.fileKind) {
      throw new BadRequestError('ขั้นตอนนี้แนบไฟล์ไม่ได้ — ส่งเป็นข้อความหรือลิงก์แทน')
    }
    if (!input.message && !input.linkUrl && !file) {
      throw new BadRequestError('กรุณาใส่ข้อความ ลิงก์ หรือแนบไฟล์อย่างน้อย 1 อย่าง')
    }

    const saved =
      file && definition.fileKind ? await storage.validateAndWrite(file, definition.fileKind) : null

    const submission = await articles.addSubmission(articleId, {
      stageCode,
      message: input.message,
      linkUrl: input.linkUrl,
      authorId,
    })

    try {
      if (saved && definition.fileKind) {
        await articles.addFile(articleId, {
          kind: definition.fileKind,
          url: saved.url,
          filename: saved.filename,
          mimeType: saved.mimeType,
          sizeBytes: saved.sizeBytes,
          uploadedById: authorId,
          submissionId: submission.id,
        })
      }
      await articles.patchStage(articleId, stageCode, { submittedAt: new Date() })
    } catch (error) {
      if (saved) await storage.removeByAbsolutePath(saved.absolutePath)
      await articles.deleteSubmission(submission.id)
      throw error
    }

    const status = await recalculateStatus(articles, articleId, customerId)
    return { status, stageCode, round: submission.round }
  }
}
