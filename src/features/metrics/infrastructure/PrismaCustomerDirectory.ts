import { prisma } from '@/infrastructure/prisma/client'
import type {
  CustomerDirectory,
  CustomerSyncTarget,
} from '../application/ports/CustomerDirectory'

const SELECT = { id: true, domain: true, userId: true, name: true, seoDevId: true } as const

type CustomerRow = {
  id: string
  domain: string
  userId: string
  name: string
  seoDevId: string | null
}

const toTarget = (c: CustomerRow): CustomerSyncTarget => ({
  customerId: c.id,
  domain: c.domain,
  userId: c.userId,
  customerName: c.name,
  seoDevUserId: c.seoDevId,
})

export class PrismaCustomerDirectory implements CustomerDirectory {
  async listSyncTargets(): Promise<CustomerSyncTarget[]> {
    const customers = await prisma.customer.findMany({ select: SELECT })
    return customers.map(toTarget)
  }

  async findSyncTargetByUserId(userId: string): Promise<CustomerSyncTarget | null> {
    const customer = await prisma.customer.findUnique({ where: { userId }, select: SELECT })
    return customer ? toTarget(customer) : null
  }
}
