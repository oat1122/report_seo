import { Role } from "@/types/auth";
import { BadRequestError } from "@/lib/errors";
import type { PaymentRepository } from "../ports/PaymentRepository";
import type { PaymentListQuery } from "../../schemas";

export function listPaymentProofsUseCase(repo: PaymentRepository) {
  return (
    query: PaymentListQuery,
    session: { user: { id: string; role: Role } },
  ) => {
    if (
      session.user.role !== Role.ADMIN &&
      session.user.role !== Role.SEO_DEV &&
      session.user.role !== Role.CUSTOMER
    ) {
      throw new BadRequestError("Invalid role");
    }
    return repo.list({
      ...query,
      scopedTo: { role: session.user.role, userId: session.user.id },
    });
  };
}
