import { PrismaPaymentRepository } from "./infrastructure/PrismaPaymentRepository";
import { LocalPaymentImageStorage } from "./infrastructure/LocalPaymentImageStorage";
import { uploadPaymentProofUseCase } from "./application/use-cases/uploadPaymentProof";
import { listPaymentProofsUseCase } from "./application/use-cases/listPaymentProofs";

const repo = new PrismaPaymentRepository();
const storage = new LocalPaymentImageStorage();

export const uploadPaymentProof = uploadPaymentProofUseCase(repo, storage);
export const listPaymentProofs = listPaymentProofsUseCase(repo);

export {
  paymentUploadSchema,
  paymentListQuerySchema,
  type PaymentUploadInput,
  type PaymentListQuery,
} from "./schemas";
export type {
  PaymentProof,
  PaymentProofWithCustomer,
  PaymentStatus,
} from "./domain/PaymentProof";
