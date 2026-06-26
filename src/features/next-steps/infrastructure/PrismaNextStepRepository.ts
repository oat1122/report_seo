import { prisma } from '@/infrastructure/prisma/client'
import { NotFoundError } from '@/lib/errors'
import type { NextStep } from '../domain/NextStep'
import type { NextStepRepository } from '../application/ports/NextStepRepository'
import type { NextStepInput } from '../schemas'

type WritePayload = Omit<NextStepInput, 'description'> & { description: string | null }

export class PrismaNextStepRepository implements NextStepRepository {
  async findByCustomerId(customerInternalId: string): Promise<NextStep[]> {
    // priority asc = HIGH → MEDIUM → LOW (ตามลำดับ enum), createdAt asc = เก่าสุดก่อน
    return prisma.customerNextStep.findMany({
      where: { customerId: customerInternalId },
      orderBy: [{ priority: 'asc' }, { createdAt: 'asc' }],
    })
  }

  async create(customerInternalId: string, data: WritePayload): Promise<NextStep> {
    return prisma.customerNextStep.create({
      data: {
        title: data.title,
        description: data.description,
        priority: data.priority,
        customerId: customerInternalId,
      },
    })
  }

  async update(stepId: string, customerInternalId: string, data: WritePayload): Promise<NextStep> {
    // ตรวจ ownership ก่อน — update by id ที่ไม่ใช่ของลูกค้านี้ไม่ได้ (rule 01)
    const existing = await prisma.customerNextStep.findFirst({
      where: { id: stepId, customerId: customerInternalId },
      select: { id: true },
    })
    if (!existing) throw new NotFoundError('Next step not found')

    return prisma.customerNextStep.update({
      where: { id: stepId },
      data: {
        title: data.title,
        description: data.description,
        priority: data.priority,
      },
    })
  }

  async delete(stepId: string, customerInternalId: string): Promise<void> {
    const res = await prisma.customerNextStep.deleteMany({
      where: { id: stepId, customerId: customerInternalId },
    })
    if (res.count === 0) throw new NotFoundError('Next step not found')
  }
}
