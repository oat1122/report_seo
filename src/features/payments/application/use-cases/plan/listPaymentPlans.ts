import type { PaymentRepository } from "../../ports/PaymentRepository";

export function listPaymentPlansUseCase(repo: PaymentRepository) {
  return (customerId: string, query?: { status?: string }) => {
    return repo.listPlansByCustomer(customerId, query?.status);
  };
}
