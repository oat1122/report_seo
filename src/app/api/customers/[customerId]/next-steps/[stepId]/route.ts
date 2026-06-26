import { z } from 'zod'
import { withApiHandler, customerAccessGuard, ok, noContent } from '@/infrastructure/http'
import { deleteNextStep, imagesToDeleteSchema, updateNextStep } from '@/features/next-steps'
import { BadRequestError } from '@/lib/errors'

const paramsSchema = z.object({
  customerId: z.uuid(),
  stepId: z.string().min(1),
})

function parseImagesToDelete(value: string | null): string[] {
  if (!value) return []
  let parsed: unknown
  try {
    parsed = JSON.parse(value)
  } catch {
    throw new BadRequestError('imagesToDelete ต้องเป็น JSON array ที่ถูกต้อง')
  }
  return imagesToDeleteSchema.parse(parsed)
}

export const PUT = withApiHandler({ params: paramsSchema }, async ({ req, params }) => {
  const ctx = await customerAccessGuard({ byUserId: params.customerId }, 'manage')

  const formData = await req.formData()
  const raw = {
    title: formData.get('title'),
    description: formData.get('description'),
    priority: formData.get('priority') ?? undefined,
  }
  const imageIdsToDelete = parseImagesToDelete(formData.get('imagesToDelete') as string | null)
  const files = formData.getAll('files').filter((f): f is File => f instanceof File && f.size > 0)

  return ok(await updateNextStep(ctx.customer.id, params.stepId, raw, files, imageIdsToDelete))
})

export const DELETE = withApiHandler({ params: paramsSchema }, async ({ params }) => {
  const ctx = await customerAccessGuard({ byUserId: params.customerId }, 'manage')
  await deleteNextStep(ctx.customer.id, params.stepId)
  return noContent()
})
