import { z } from 'zod'
import { withApiHandler, customerAccessGuard, noContent } from '@/infrastructure/http'
import { deleteKeywordImage } from '@/features/keywords'

const paramsSchema = z.object({
  keywordId: z.string().min(1),
  imageId: z.string().min(1),
})

export const DELETE = withApiHandler({ params: paramsSchema }, async ({ params }) => {
  await customerAccessGuard({ byKeywordId: params.keywordId }, 'manage')
  await deleteKeywordImage(params.keywordId, params.imageId)
  return noContent()
})
