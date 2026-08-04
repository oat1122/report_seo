import { z } from 'zod'
import { withApiHandler, customerAccessGuard, created } from '@/infrastructure/http'
import { BadRequestError } from '@/lib/errors'
import { createNotification, NOTIFICATION_TYPES } from '@/features/notifications'
import {
  BLOG_STAGE_CODES,
  getStageLabel,
  submitStageWork,
  submitStageWorkSchema,
} from '@/features/blog-plan'

const paramsSchema = z.object({
  customerId: z.uuid(),
  articleId: z.uuid(),
  stageCode: z.enum(BLOG_STAGE_CODES),
})

// Multipart — withApiHandler ไม่ parse multipart body จึงดึง formData() เอง
export const POST = withApiHandler({ params: paramsSchema }, async ({ req, params, session }) => {
  const ctx = await customerAccessGuard({ byUserId: params.customerId }, 'blog-manage')

  const form = await req.formData()
  const parsed = submitStageWorkSchema.safeParse({
    message: form.get('message') || null,
    linkUrl: form.get('linkUrl') || null,
  })
  if (!parsed.success) {
    throw new BadRequestError('ข้อความหรือลิงก์ไม่ถูกต้อง')
  }

  const rawFile = form.get('file')
  const file = rawFile instanceof File && rawFile.size > 0 ? rawFile : null

  const result = await submitStageWork(
    params.articleId,
    ctx.customer.id,
    params.stageCode,
    parsed.data,
    file,
    session.user.id,
  )

  createNotification({
    type: NOTIFICATION_TYPES.BLOG_STAGE_SUBMITTED,
    recipientUserIds: [ctx.customer.userId],
    actorId: session.user.id,
    title: 'มีงานบทความส่งมาให้ตรวจ',
    body:
      result.round > 1
        ? `ขั้นตอน "${getStageLabel(params.stageCode)}" ส่งใหม่ (รอบ ${result.round})`
        : `ขั้นตอน "${getStageLabel(params.stageCode)}" ถูกส่งแล้ว`,
    metadata: { url: `/customer/${params.customerId}/blog-plan` },
  }).catch(() => {})

  return created(result)
})
