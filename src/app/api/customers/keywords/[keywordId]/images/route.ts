import { z } from 'zod'
import { withApiHandler, customerAccessGuard, ok } from '@/infrastructure/http'
import { addKeywordImages } from '@/features/keywords'

const paramsSchema = z.object({ keywordId: z.string().min(1) })

export const POST = withApiHandler({ params: paramsSchema }, async ({ req, params }) => {
  await customerAccessGuard({ byKeywordId: params.keywordId }, 'manage')
  const formData = await req.formData()
  const files = formData.getAll('files') as File[]
  return ok(await addKeywordImages(params.keywordId, files))
})
