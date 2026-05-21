import { prisma } from "@/infrastructure/prisma/client";
import type {
  CustomerProfile,
  CustomerProfileRepository,
} from "../application/ports/CustomerProfileRepository";

export class PrismaCustomerProfileRepository
  implements CustomerProfileRepository
{
  async findByUserId(userId: string): Promise<CustomerProfile | null> {
    const customer = await prisma.customer.findUnique({
      where: { userId },
      select: {
        id: true,
        userId: true,
        name: true,
        domain: true,
        user: { select: { name: true } },
      },
    });
    if (!customer) return null;
    return {
      id: customer.id,
      userId: customer.userId,
      name: customer.name,
      domain: customer.domain,
      customerName: customer.user.name,
    };
  }
}
