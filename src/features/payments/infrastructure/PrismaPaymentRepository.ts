import { prisma } from '@/infrastructure/prisma/client'
import { Role } from '@/types/auth'
import type { PaymentProof, PaymentProofWithCustomer } from '../domain/PaymentProof'
import type { PaymentPlan, PaymentPlanWithCycles } from '../domain/PaymentPlan'
import type { BillingCycle, BillingCycleWithPlan } from '../domain/BillingCycle'
import type { ContractFile } from '../domain/ContractFile'
import type { BillingCycleSeed } from '../domain/policies/billing-cycle-generator'
import type {
  CreatePlanData,
  PaymentListFilter,
  PaymentRepository,
  UpdateCycleData,
  UpdatePlanData,
} from '../application/ports/PaymentRepository'

function decimalToNumber(val: unknown): number {
  if (val == null) return 0
  return Number(val)
}

export class PrismaPaymentRepository implements PaymentRepository {
  // --- Payment Proof ---

  async createProof(
    customerInternalId: string,
    publicUrl: string,
    billingCycleId?: string,
  ): Promise<PaymentProof> {
    const row = await prisma.paymentProof.create({
      data: {
        uploadUrl: publicUrl,
        customerId: customerInternalId,
        status: 'PENDING',
        ...(billingCycleId ? { billingCycleId } : {}),
      },
    })
    return { ...row, billingCycleId: row.billingCycleId ?? null }
  }

  async list(filter: PaymentListFilter): Promise<PaymentProofWithCustomer[]> {
    const where: Record<string, unknown> = {}
    if (filter.status) where.status = filter.status
    if (filter.customerId) where.customerId = filter.customerId

    if (filter.scopedTo.role === Role.CUSTOMER) {
      where.customer = { is: { userId: filter.scopedTo.userId } }
    } else if (filter.scopedTo.role === Role.SEO_DEV) {
      where.customer = { is: { seoDevId: filter.scopedTo.userId } }
    }

    const rows = await prisma.paymentProof.findMany({
      where,
      include: {
        customer: { select: { id: true, name: true, domain: true } },
        billingCycle: {
          select: {
            cycleNumber: true,
            plan: { select: { description: true } },
          },
        },
      },
      orderBy: { uploadDate: 'desc' },
    })

    return rows.map((r) => ({
      ...r,
      billingCycleId: r.billingCycleId ?? null,
      billingCycle: r.billingCycle
        ? { cycleNumber: r.billingCycle.cycleNumber, plan: r.billingCycle.plan }
        : null,
    }))
  }

  async findProofById(proofId: string): Promise<PaymentProof | null> {
    const row = await prisma.paymentProof.findUnique({ where: { id: proofId } })
    if (!row) return null
    return { ...row, billingCycleId: row.billingCycleId ?? null }
  }

  async updateProofStatus(proofId: string, status: 'APPROVED' | 'REJECTED'): Promise<PaymentProof> {
    const row = await prisma.paymentProof.update({
      where: { id: proofId },
      data: { status },
    })
    return { ...row, billingCycleId: row.billingCycleId ?? null }
  }

  // --- Payment Plan ---

  async createPlanWithCycles(
    customerId: string,
    data: CreatePlanData,
    cycles: BillingCycleSeed[],
  ): Promise<PaymentPlan> {
    const row = await prisma.$transaction(async (tx) => {
      const plan = await tx.paymentPlan.create({
        data: {
          customerId,
          type: data.type,
          amount: data.amount,
          description: data.description,
          billingDay: data.billingDay,
          totalInstallments: data.totalInstallments,
          startDate: data.startDate,
          endDate: data.endDate,
          note: data.note,
        },
      })

      if (cycles.length > 0) {
        await tx.billingCycle.createMany({
          data: cycles.map((seed) => ({
            planId: plan.id,
            cycleNumber: seed.cycleNumber,
            dueDate: seed.dueDate,
            amount: seed.amount,
          })),
        })
      }

      return plan
    })

    return this.mapPlan(row)
  }

  async listPlansByCustomer(customerId: string, status?: string): Promise<PaymentPlan[]> {
    const where: Record<string, unknown> = { customerId }
    if (status) where.status = status

    const rows = await prisma.paymentPlan.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    })

    return rows.map((r) => this.mapPlan(r))
  }

  async findPlanById(planId: string): Promise<PaymentPlanWithCycles | null> {
    const row = await prisma.paymentPlan.findUnique({
      where: { id: planId },
      include: {
        billingCycles: {
          orderBy: { cycleNumber: 'asc' },
          include: {
            proofs: {
              orderBy: { uploadDate: 'desc' },
            },
          },
        },
      },
    })

    if (!row) return null

    return {
      ...this.mapPlan(row),
      billingCycles: row.billingCycles.map((c) => ({
        ...this.mapCycle(c),
        proofs: c.proofs.map((p) => ({
          ...p,
          billingCycleId: p.billingCycleId ?? null,
        })),
      })),
    }
  }

  async updatePlan(planId: string, data: UpdatePlanData): Promise<PaymentPlan> {
    const row = await prisma.paymentPlan.update({
      where: { id: planId },
      data,
    })
    return this.mapPlan(row)
  }

  async cancelPlan(planId: string): Promise<PaymentPlan> {
    const row = await prisma.$transaction(async (tx) => {
      await tx.billingCycle.updateMany({
        where: { planId, status: { in: ['PENDING', 'REVIEWING'] } },
        data: { status: 'CANCELLED' },
      })

      return tx.paymentPlan.update({
        where: { id: planId },
        data: { status: 'CANCELLED' },
      })
    })
    return this.mapPlan(row)
  }

  // --- Billing Cycle ---

  async findCycleById(cycleId: string): Promise<BillingCycle | null> {
    const row = await prisma.billingCycle.findUnique({
      where: { id: cycleId },
    })
    if (!row) return null
    return this.mapCycle(row)
  }

  async listCyclesByPlan(planId: string): Promise<BillingCycleWithPlan[]> {
    const rows = await prisma.billingCycle.findMany({
      where: { planId },
      include: {
        plan: { select: { id: true, description: true, type: true } },
        proofs: { orderBy: { uploadDate: 'desc' } },
        documents: { where: { type: 'INVOICE' }, select: { id: true }, take: 1 },
      },
      orderBy: { cycleNumber: 'asc' },
    })

    return rows.map((r) => ({
      ...this.mapCycle(r),
      plan: r.plan,
      proofs: r.proofs.map((p) => ({
        ...p,
        billingCycleId: p.billingCycleId ?? null,
      })),
      hasInvoiceDocument: r.documents.length > 0,
    }))
  }

  async listCyclesByCustomer(customerId: string): Promise<BillingCycleWithPlan[]> {
    const rows = await prisma.billingCycle.findMany({
      where: { plan: { customerId, status: { not: 'CANCELLED' } } },
      include: {
        plan: { select: { id: true, description: true, type: true } },
        proofs: { orderBy: { uploadDate: 'desc' } },
        documents: { where: { type: 'INVOICE' }, select: { id: true }, take: 1 },
      },
      orderBy: { dueDate: 'asc' },
    })

    return rows.map((r) => ({
      ...this.mapCycle(r),
      plan: r.plan,
      proofs: r.proofs.map((p) => ({
        ...p,
        billingCycleId: p.billingCycleId ?? null,
      })),
      hasInvoiceDocument: r.documents.length > 0,
    }))
  }

  async updateCycle(cycleId: string, data: UpdateCycleData): Promise<BillingCycle> {
    const row = await prisma.billingCycle.update({
      where: { id: cycleId },
      data,
    })
    return this.mapCycle(row)
  }

  async updatePendingCyclesAmount(planId: string, amount: number): Promise<void> {
    await prisma.billingCycle.updateMany({
      where: { planId, status: { in: ['PENDING', 'REVIEWING', 'OVERDUE'] } },
      data: { amount },
    })
  }

  async countPendingCyclesByPlan(planId: string): Promise<number> {
    return prisma.billingCycle.count({
      where: { planId, status: { in: ['PENDING', 'REVIEWING', 'OVERDUE'] } },
    })
  }

  async completePlan(planId: string): Promise<void> {
    await prisma.paymentPlan.update({
      where: { id: planId },
      data: { status: 'COMPLETED' },
    })
  }

  async reactivatePlan(planId: string): Promise<void> {
    await prisma.paymentPlan.update({
      where: { id: planId },
      data: { status: 'ACTIVE' },
    })
  }

  async reactivateCancelledPlan(planId: string): Promise<PaymentPlan> {
    const row = await prisma.$transaction(async (tx) => {
      await tx.billingCycle.updateMany({
        where: { planId, status: 'CANCELLED' },
        data: { status: 'PENDING' },
      })

      return tx.paymentPlan.update({
        where: { id: planId },
        data: { status: 'ACTIVE' },
      })
    })
    return this.mapPlan(row)
  }

  // --- Contract File ---

  async createContractFile(
    customerId: string,
    fileUrl: string,
    fileName: string,
  ): Promise<ContractFile> {
    return prisma.contractFile.create({
      data: { customerId, fileUrl, fileName },
    })
  }

  async listContractFiles(customerId: string): Promise<ContractFile[]> {
    return prisma.contractFile.findMany({
      where: { customerId },
      orderBy: { uploadDate: 'desc' },
    })
  }

  async findContractFileById(id: string): Promise<ContractFile | null> {
    return prisma.contractFile.findUnique({ where: { id } })
  }

  async deleteContractFile(id: string): Promise<void> {
    await prisma.contractFile.delete({ where: { id } })
  }

  // --- Helpers ---

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private mapPlan(row: any): PaymentPlan {
    return {
      id: row.id,
      customerId: row.customerId,
      type: row.type,
      amount: decimalToNumber(row.amount),
      description: row.description,
      billingDay: row.billingDay,
      totalInstallments: row.totalInstallments,
      startDate: row.startDate,
      endDate: row.endDate,
      status: row.status,
      note: row.note,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private mapCycle(row: any): BillingCycle {
    return {
      id: row.id,
      planId: row.planId,
      cycleNumber: row.cycleNumber,
      dueDate: row.dueDate,
      amount: decimalToNumber(row.amount),
      status: row.status,
      paidDate: row.paidDate,
      note: row.note,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    }
  }
}
