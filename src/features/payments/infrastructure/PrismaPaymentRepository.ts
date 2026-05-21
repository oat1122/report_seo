import { prisma } from "@/infrastructure/prisma/client";
import { Role } from "@/types/auth";
import type {
  PaymentProof,
  PaymentProofWithCustomer,
} from "../domain/PaymentProof";
import type {
  PaymentListFilter,
  PaymentRepository,
} from "../application/ports/PaymentRepository";

export class PrismaPaymentRepository implements PaymentRepository {
  async createProof(
    customerInternalId: string,
    publicUrl: string,
  ): Promise<PaymentProof> {
    return prisma.paymentProof.create({
      data: {
        uploadUrl: publicUrl,
        customerId: customerInternalId,
        status: "PENDING",
      },
    });
  }

  async list(filter: PaymentListFilter): Promise<PaymentProofWithCustomer[]> {
    const where: Record<string, unknown> = {};
    if (filter.status) where.status = filter.status;
    if (filter.customerId) where.customerId = filter.customerId;

    if (filter.scopedTo.role === Role.CUSTOMER) {
      where.customer = { is: { userId: filter.scopedTo.userId } };
    } else if (filter.scopedTo.role === Role.SEO_DEV) {
      where.customer = { is: { seoDevId: filter.scopedTo.userId } };
    }
    // ADMIN เห็นทั้งหมดตาม filter

    return prisma.paymentProof.findMany({
      where,
      include: {
        customer: { select: { id: true, name: true, domain: true } },
      },
      orderBy: { uploadDate: "desc" },
    });
  }
}
