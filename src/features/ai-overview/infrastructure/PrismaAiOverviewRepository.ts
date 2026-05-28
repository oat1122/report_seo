import { prisma } from '@/infrastructure/prisma/client'
import type { AiOverview } from '../domain/AiOverview'
import type { AiOverviewRepository } from '../application/ports/AiOverviewRepository'
import type { AiOverviewCreateInput, AiOverviewUpdateInput } from '../schemas'

export class PrismaAiOverviewRepository implements AiOverviewRepository {
  async findByCustomerId(customerInternalId: string): Promise<AiOverview[]> {
    return prisma.aiOverview.findMany({
      where: { customerId: customerInternalId },
      include: { images: true },
      orderBy: { createdAt: 'desc' },
    })
  }

  async findById(id: string, customerInternalId: string): Promise<AiOverview | null> {
    return prisma.aiOverview.findFirst({
      where: { id, customerId: customerInternalId },
      include: { images: true },
    })
  }

  async create(
    customerInternalId: string,
    input: AiOverviewCreateInput,
    imageUrls: string[],
  ): Promise<AiOverview> {
    return prisma.aiOverview.create({
      data: {
        title: input.title,
        displayDate: input.displayDate ?? new Date(),
        customerId: customerInternalId,
        images: {
          create: imageUrls.map((url) => ({ imageUrl: url })),
        },
      },
      include: { images: true },
    })
  }

  async applyUpdate(
    id: string,
    input: AiOverviewUpdateInput,
    options: {
      imageIdsToRemove: string[]
      newImageUrls: string[]
      fallbackDisplayDate: Date
    },
  ): Promise<AiOverview> {
    return prisma.$transaction(async (tx) => {
      if (options.imageIdsToRemove.length > 0) {
        await tx.aiOverviewImage.deleteMany({
          where: { id: { in: options.imageIdsToRemove } },
        })
      }

      return tx.aiOverview.update({
        where: { id },
        data: {
          title: input.title,
          displayDate: input.displayDate ?? options.fallbackDisplayDate,
          ...(options.newImageUrls.length > 0 && {
            images: {
              create: options.newImageUrls.map((url) => ({ imageUrl: url })),
            },
          }),
        },
        include: { images: true },
      })
    })
  }

  async delete(id: string): Promise<void> {
    await prisma.aiOverview.delete({ where: { id } })
  }
}
