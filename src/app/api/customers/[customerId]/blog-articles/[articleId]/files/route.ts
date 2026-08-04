import { z } from 'zod'
import { withApiHandler, customerAccessGuard, created } from '@/infrastructure/http'
import { BadRequestError } from '@/lib/errors'
import { uploadArticleFile, uploadFileKindSchema } from '@/features/blog-plan'

const paramsSchema = z.object({
  customerId: z.uuid(),
  articleId: z.uuid(),
})

// Multipart upload — withApiHandler ไม่ parse multipart body จึงดึง formData() เอง
export const POST = withApiHandler({ params: paramsSchema }, async ({ req, params, session }) => {
  const ctx = await customerAccessGuard({ byUserId: params.customerId }, 'blog-manage')

  const form = await req.formData()
  const file = form.get('file')
  if (!(file instanceof File)) {
    throw new BadRequestError("กรุณาแนบไฟล์ผ่าน field 'file'")
  }

  const kind = uploadFileKindSchema.safeParse(form.get('kind'))
  if (!kind.success) {
    throw new BadRequestError("field 'kind' ต้องเป็น COVER_IMAGE หรือ ARTICLE_DOC")
  }

  return created(
    await uploadArticleFile(params.articleId, ctx.customer.id, file, kind.data, session.user.id),
  )
})
