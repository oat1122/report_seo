import type { PaymentRepository } from "../ports/PaymentRepository";
import type { PaymentImageStorage } from "../ports/PaymentImageStorage";

export function uploadPaymentProofUseCase(
  repo: PaymentRepository,
  storage: PaymentImageStorage,
) {
  return async (file: File, customerInternalId: string) => {
    const saved = await storage.validateAndWrite(file);
    try {
      return await repo.createProof(customerInternalId, saved.url);
    } catch (error) {
      await storage.removeByAbsolutePath(saved.absolutePath);
      throw error;
    }
  };
}
