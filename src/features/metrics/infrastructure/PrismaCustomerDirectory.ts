import { prisma } from '@/infrastructure/prisma/client'
import type {
  CustomerDirectory,
  CustomerSyncTarget,
} from '../application/ports/CustomerDirectory'

export class PrismaCustomerDirectory implements CustomerDirectory {
  async listSyncTargets(): Promise<CustomerSyncTarget[]> {
    const customers = await prisma.customer.findMany({
      select: { id: true, domain: true },
    })
    return customers.map((c) => ({ customerId: c.id, domain: c.domain }))
  }

  async findSyncTargetByUserId(userId: string): Promise<CustomerSyncTarget | null> {
    const customer = await prisma.customer.findUnique({
      where: { userId },
      select: { id: true, domain: true },
    })
    return customer ? { customerId: customer.id, domain: customer.domain } : null
  }
}
