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
      include: { images: true },
      orderBy: [{ priority: 'asc' }, { createdAt: 'asc' }],
    })
  }

  async findById(stepId: string, customerInternalId: string): Promise<NextStep | null> {
    return prisma.customerNextStep.findFirst({
      where: { id: stepId, customerId: customerInternalId },
      include: { images: true },
    })
  }

  async create(
    customerInternalId: string,
    data: WritePayload,
    imageUrls: string[],
  ): Promise<NextStep> {
    return prisma.customerNextStep.create({
      data: {
        title: data.title,
        description: data.description,
        priority: data.priority,
        customerId: customerInternalId,
        images: { create: imageUrls.map((url) => ({ imageUrl: url })) },
      },
      include: { images: true },
    })
  }

  async applyUpdate(
    stepId: string,
    data: WritePayload,
    options: { imageIdsToRemove: string[]; newImageUrls: string[] },
  ): Promise<NextStep> {
    return prisma.$transaction(async (tx) => {
      if (options.imageIdsToRemove.length > 0) {
        await tx.customerNextStepImage.deleteMany({
          where: { id: { in: options.imageIdsToRemove }, nextStepId: stepId },
        })
      }

      return tx.customerNextStep.update({
        where: { id: stepId },
        data: {
          title: data.title,
          description: data.description,
          priority: data.priority,
          ...(options.newImageUrls.length > 0 && {
            images: { create: options.newImageUrls.map((url) => ({ imageUrl: url })) },
          }),
        },
        include: { images: true },
      })
    })
  }

  async delete(stepId: string): Promise<void> {
    // image rows ถูก cascade ลบโดย DB (onDelete: Cascade) — ไฟล์บนดิสก์ cleanup ใน use case
    const res = await prisma.customerNextStep.deleteMany({ where: { id: stepId } })
    if (res.count === 0) throw new NotFoundError('Next step not found')
  }
}
