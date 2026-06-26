import { z } from 'zod'
import { withApiHandler, customerAccessGuard, ok, created } from '@/infrastructure/http'
import { addNextStep, listNextSteps } from '@/features/next-steps'

const paramsSchema = z.object({ customerId: z.uuid() })

function pickFiles(formData: FormData): File[] {
  return formData.getAll('files').filter((f): f is File => f instanceof File && f.size > 0)
}

export const GET = withApiHandler({ params: paramsSchema }, async ({ params }) => {
  const ctx = await customerAccessGuard({ byUserId: params.customerId }, 'read')
  return ok(await listNextSteps(ctx.customer.id))
})

export const POST = withApiHandler({ params: paramsSchema }, async ({ req, params }) => {
  const ctx = await customerAccessGuard({ byUserId: params.customerId }, 'manage')

  const formData = await req.formData()
  const raw = {
    title: formData.get('title'),
    description: formData.get('description'),
    priority: formData.get('priority') ?? undefined,
  }

  return created(await addNextStep(ctx.customer.id, raw, pickFiles(formData)))
})
