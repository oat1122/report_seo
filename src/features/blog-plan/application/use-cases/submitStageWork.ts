import { BadRequestError, NotFoundError } from '@/lib/errors'
import type { BlogArticleStatus, BlogFileKind, BlogStageCode } from '../../domain/BlogArticle'
import { BLOG_FILE_KIND_LABELS, getStageDefinition } from '../../domain/policies/stage-schedule'
import type { BlogArticleRepository } from '../ports/BlogArticleRepository'
import type { BlogFileStorage, SavedBlogFile } from '../ports/BlogFileStorage'
import type { SubmitStageWorkInput } from '../../schemas'
import { recalculateStatus } from './recalculateStatus'

export interface StageWorkFile {
  kind: BlogFileKind
  file: File
}

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
    files: StageWorkFile[],
    authorId: string | null,
  ): Promise<SubmitStageWorkResult> => {
    const article = await articles.findByIdForCustomer(articleId, customerId)
    if (!article) throw new NotFoundError('ไม่พบบทความ')

    const definition = getStageDefinition(stageCode)
    if (definition.actor !== 'WRITER') {
      throw new BadRequestError('ขั้นตอนนี้ต้องให้ลูกค้าเป็นผู้ตอบ')
    }
    if (!article.stages.some((stage) => stage.stageCode === stageCode)) {
      throw new BadRequestError('ขั้นตอนนี้ไม่อยู่ในแผนของบทความนี้')
    }

    const unexpected = files.find((item) => !definition.fileKinds.includes(item.kind))
    if (unexpected) {
      throw new BadRequestError(
        `ขั้นตอนนี้แนบ${BLOG_FILE_KIND_LABELS[unexpected.kind]}ไม่ได้ — ส่งเป็นข้อความหรือลิงก์แทน`,
      )
    }

    const missing = definition.requiredFileKinds.filter(
      (kind) => !files.some((item) => item.kind === kind),
    )
    if (missing.length > 0) {
      const wanted = missing.map((kind) => BLOG_FILE_KIND_LABELS[kind]).join(' และ ')
      throw new BadRequestError(`ต้องแนบ${wanted}ให้ครบก่อนส่ง`)
    }
    if (!input.message && !input.linkUrl && files.length === 0) {
      throw new BadRequestError('กรุณาใส่ข้อความ ลิงก์ หรือแนบไฟล์อย่างน้อย 1 อย่าง')
    }

    const saved: SavedBlogFile[] = []
    try {
      for (const item of files) {
        saved.push(await storage.validateAndWrite(item.file, item.kind))
      }
    } catch (error) {
      await removeSaved(storage, saved)
      throw error
    }

    const submission = await articles.addSubmission(articleId, {
      stageCode,
      message: input.message,
      linkUrl: input.linkUrl,
      authorId,
    })

    try {
      for (const [index, item] of files.entries()) {
        await articles.addFile(articleId, {
          kind: item.kind,
          url: saved[index].url,
          filename: saved[index].filename,
          mimeType: saved[index].mimeType,
          sizeBytes: saved[index].sizeBytes,
          uploadedById: authorId,
          submissionId: submission.id,
        })
      }
      await articles.patchStage(articleId, stageCode, { submittedAt: new Date() })
    } catch (error) {
      await removeSaved(storage, saved)
      await articles.deleteSubmission(submission.id)
      throw error
    }

    const status = await recalculateStatus(articles, articleId, customerId)
    return { status, stageCode, round: submission.round }
  }
}

async function removeSaved(storage: BlogFileStorage, saved: SavedBlogFile[]): Promise<void> {
  await Promise.all(saved.map((file) => storage.removeByAbsolutePath(file.absolutePath)))
}
