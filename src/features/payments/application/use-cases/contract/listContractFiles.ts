import type { PaymentRepository } from "../../ports/PaymentRepository";

export function listContractFilesUseCase(repo: PaymentRepository) {
  return (customerId: string) => {
    return repo.listContractFiles(customerId);
  };
}
