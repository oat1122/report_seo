// Public API ของ customers feature
// route handler / feature อื่นต้อง import จากที่นี่เท่านั้น ห้าม import deep path

import { PrismaCustomerRepository } from './infrastructure/PrismaCustomerRepository'
import { NextAuthSessionGateway } from './infrastructure/NextAuthSessionGateway'
import { resolveCustomerAccessUseCase } from './application/use-cases/resolveCustomerAccess'

const customerRepository = new PrismaCustomerRepository()
const sessionGateway = new NextAuthSessionGateway()

export const resolveCustomerAccess = resolveCustomerAccessUseCase(
  customerRepository,
  sessionGateway,
)

export { enforceReadAccess, enforceManageAccess } from './application/use-cases/enforceAccess'

export type { CustomerAccessQuery } from './application/use-cases/resolveCustomerAccess'
export { CustomerAccessContext } from './domain/AccessContext'
export type { SessionUser } from './domain/AccessContext'
export type { Customer } from './domain/Customer'
