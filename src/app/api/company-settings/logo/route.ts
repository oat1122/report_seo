import { NextRequest } from 'next/server'
import { withApiHandler, ok } from '@/infrastructure/http'
import { uploadLogo } from '@/features/company-settings'
import { BadRequestError } from '@/lib/errors'
import { Role } from '@/types/auth'

export const POST = withApiHandler(
  { roles: [Role.ADMIN] },
  async ({ req }: { req: NextRequest }) => {
    const formData = await req.formData()
    const file = formData.get('logo')
    if (!file || !(file instanceof File)) {
      throw new BadRequestError('กรุณาเลือกไฟล์โลโก้')
    }
    return ok(await uploadLogo(file))
  },
)
