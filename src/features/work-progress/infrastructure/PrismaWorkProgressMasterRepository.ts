import { prisma } from '@/infrastructure/prisma/client'
import { Prisma } from '@prisma/client'
import { ConflictError } from '@/lib/errors'
import type {
  WorkProgressCategory,
  WorkProgressStatus,
  WorkProgressMarkType,
  MasterKind,
} from '../domain/WorkProgressMaster'
import type {
  UpsertCategoryData,
  UpsertMarkTypeData,
  UpsertStatusData,
  WorkProgressMasterRepository,
} from '../application/ports/WorkProgressMasterRepository'

export class PrismaWorkProgressMasterRepository implements WorkProgressMasterRepository {
  async listCategories(options: { onlyActive: boolean }): Promise<WorkProgressCategory[]> {
    return prisma.workProgressCategory.findMany({
      where: options.onlyActive ? { isActive: true } : undefined,
      orderBy: [{ orderIndex: 'asc' }, { name: 'asc' }],
    })
  }

  async listStatuses(options: { onlyActive: boolean }): Promise<WorkProgressStatus[]> {
    return prisma.workProgressStatus.findMany({
      where: options.onlyActive ? { isActive: true } : undefined,
      orderBy: [{ orderIndex: 'asc' }, { name: 'asc' }],
    })
  }

  async listMarkTypes(options: { onlyActive: boolean }): Promise<WorkProgressMarkType[]> {
    return prisma.workProgressMarkType.findMany({
      where: options.onlyActive ? { isActive: true } : undefined,
      orderBy: [{ orderIndex: 'asc' }, { name: 'asc' }],
    })
  }

  findCategoryById(id: string): Promise<WorkProgressCategory | null> {
    return prisma.workProgressCategory.findUnique({ where: { id } })
  }
  findStatusById(id: string): Promise<WorkProgressStatus | null> {
    return prisma.workProgressStatus.findUnique({ where: { id } })
  }
  findMarkTypeById(id: string): Promise<WorkProgressMarkType | null> {
    return prisma.workProgressMarkType.findUnique({ where: { id } })
  }

  findDefaultStatus(): Promise<WorkProgressStatus | null> {
    return prisma.workProgressStatus.findFirst({
      where: { isDefault: true, isActive: true },
      orderBy: { orderIndex: 'asc' },
    })
  }

  async createCategory(data: UpsertCategoryData): Promise<WorkProgressCategory> {
    try {
      return await prisma.workProgressCategory.create({ data })
    } catch (e) {
      throw this.toUniqueError(e, 'code หมวดหมู่ซ้ำ')
    }
  }

  async updateCategory(
    id: string,
    data: Partial<UpsertCategoryData>,
  ): Promise<WorkProgressCategory> {
    try {
      return await prisma.workProgressCategory.update({ where: { id }, data })
    } catch (e) {
      throw this.toUniqueError(e, 'code หมวดหมู่ซ้ำ')
    }
  }

  async createStatus(data: UpsertStatusData): Promise<WorkProgressStatus> {
    // ถ้า isDefault=true → unset row อื่นใน $transaction ก่อน create
    return prisma.$transaction(async (tx) => {
      if (data.isDefault) {
        await tx.workProgressStatus.updateMany({
          where: { isDefault: true },
          data: { isDefault: false },
        })
      }
      try {
        return await tx.workProgressStatus.create({ data })
      } catch (e) {
        throw this.toUniqueError(e, 'code สถานะซ้ำ')
      }
    })
  }

  async updateStatus(id: string, data: Partial<UpsertStatusData>): Promise<WorkProgressStatus> {
    return prisma.$transaction(async (tx) => {
      if (data.isDefault === true) {
        await tx.workProgressStatus.updateMany({
          where: { isDefault: true, NOT: { id } },
          data: { isDefault: false },
        })
      }
      try {
        return await tx.workProgressStatus.update({ where: { id }, data })
      } catch (e) {
        throw this.toUniqueError(e, 'code สถานะซ้ำ')
      }
    })
  }

  async createMarkType(data: UpsertMarkTypeData): Promise<WorkProgressMarkType> {
    try {
      return await prisma.workProgressMarkType.create({ data })
    } catch (e) {
      throw this.toUniqueError(e, 'code ประเภทเครื่องหมายซ้ำ')
    }
  }

  async updateMarkType(
    id: string,
    data: Partial<UpsertMarkTypeData>,
  ): Promise<WorkProgressMarkType> {
    try {
      return await prisma.workProgressMarkType.update({ where: { id }, data })
    } catch (e) {
      throw this.toUniqueError(e, 'code ประเภทเครื่องหมายซ้ำ')
    }
  }

  async deactivate(kind: MasterKind, id: string): Promise<void> {
    const data = { isActive: false }
    switch (kind) {
      case 'category':
        await prisma.workProgressCategory.update({ where: { id }, data })
        return
      case 'status':
        await prisma.workProgressStatus.update({ where: { id }, data })
        return
      case 'markType':
        await prisma.workProgressMarkType.update({ where: { id }, data })
        return
    }
  }

  async countReferences(kind: MasterKind, id: string): Promise<number> {
    switch (kind) {
      case 'category':
        return prisma.workProgressItem.count({ where: { categoryId: id } })
      case 'status':
        return prisma.workProgressItem.count({ where: { statusId: id } })
      case 'markType':
        return prisma.workProgressItemPeriodMark.count({
          where: { markTypeId: id },
        })
    }
  }

  // P2002 = unique constraint failed → 409 Conflict (rule 03 — typed error)
  private toUniqueError(e: unknown, message: string): Error {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
      return new ConflictError(message)
    }
    return e as Error
  }
}
