import { z } from 'zod'
import { withApiHandler, customerAccessGuard, ok } from '@/infrastructure/http'
import { ForbiddenError } from '@/lib/errors'
import { getBlogSettings, updateBlogSettings, updateBlogSettingsSchema } from '@/features/blog-plan'

const paramsSchema = z.object({ customerId: z.uuid() })

export const GET = withApiHandler({ params: paramsSchema }, async ({ params }) => {
  const ctx = await customerAccessGuard({ byUserId: params.customerId }, 'blog-read')
  return ok(await getBlogSettings(ctx.customer.id))
})

export const PATCH = withApiHandler(
  { params: paramsSchema, body: updateBlogSettingsSchema },
  async ({ params, body }) => {
    // โควตา + การมอบหมาย writer เป็นข้อตกลงเชิงพาณิชย์ — admin เท่านั้น
    const ctx = await customerAccessGuard({ byUserId: params.customerId }, 'blog-read')
    if (!ctx.isAdmin) throw new ForbiddenError()
    return ok(await updateBlogSettings(ctx.customer.id, body))
  },
)
