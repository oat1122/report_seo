import { PrismaPaymentRepository } from "./infrastructure/PrismaPaymentRepository";
import { LocalPaymentImageStorage } from "./infrastructure/LocalPaymentImageStorage";
import { LocalContractFileStorage } from "./infrastructure/LocalContractFileStorage";

import { uploadPaymentProofUseCase } from "./application/use-cases/uploadPaymentProof";
import { listPaymentProofsUseCase } from "./application/use-cases/listPaymentProofs";
import { createPaymentPlanUseCase } from "./application/use-cases/plan/createPaymentPlan";
import { listPaymentPlansUseCase } from "./application/use-cases/plan/listPaymentPlans";
import { getPaymentPlanUseCase } from "./application/use-cases/plan/getPaymentPlan";
import { updatePaymentPlanUseCase } from "./application/use-cases/plan/updatePaymentPlan";
import { cancelPaymentPlanUseCase } from "./application/use-cases/plan/cancelPaymentPlan";
import { listBillingCyclesUseCase } from "./application/use-cases/cycle/listBillingCycles";
import { updateBillingCycleUseCase } from "./application/use-cases/cycle/updateBillingCycle";
import { uploadContractFileUseCase } from "./application/use-cases/contract/uploadContractFile";
import { listContractFilesUseCase } from "./application/use-cases/contract/listContractFiles";
import { deleteContractFileUseCase } from "./application/use-cases/contract/deleteContractFile";
import { approveRejectProofUseCase } from "./application/use-cases/proof/approveRejectProof";

const repo = new PrismaPaymentRepository();
const imageStorage = new LocalPaymentImageStorage();
const contractStorage = new LocalContractFileStorage();

// Payment Proof
export const uploadPaymentProof = uploadPaymentProofUseCase(repo, imageStorage);
export const listPaymentProofs = listPaymentProofsUseCase(repo);
export const approveRejectProof = approveRejectProofUseCase(repo);

// Payment Plan
export const createPaymentPlan = createPaymentPlanUseCase(repo);
export const listPaymentPlans = listPaymentPlansUseCase(repo);
export const getPaymentPlan = getPaymentPlanUseCase(repo);
export const updatePaymentPlan = updatePaymentPlanUseCase(repo);
export const cancelPaymentPlan = cancelPaymentPlanUseCase(repo);

// Billing Cycle
export const listBillingCycles = listBillingCyclesUseCase(repo);
export const updateBillingCycle = updateBillingCycleUseCase(repo);

// Contract File
export const uploadContractFile = uploadContractFileUseCase(repo, contractStorage);
export const listContractFiles = listContractFilesUseCase(repo);
export const deleteContractFile = deleteContractFileUseCase(repo, contractStorage);

// Schemas
export {
  paymentUploadSchema,
  paymentListQuerySchema,
  createPaymentPlanSchema,
  updatePaymentPlanSchema,
  listPaymentPlansQuerySchema,
  updateBillingCycleSchema,
  listBillingCyclesQuerySchema,
  updateProofStatusSchema,
  type PaymentUploadInput,
  type PaymentListQuery,
  type CreatePaymentPlanInput,
  type UpdatePaymentPlanInput,
  type ListPaymentPlansQuery,
  type UpdateBillingCycleInput,
  type ListBillingCyclesQuery,
  type UpdateProofStatusInput,
} from "./schemas";

// Domain types
export type {
  PaymentProof,
  PaymentProofWithCustomer,
  PaymentStatus,
} from "./domain/PaymentProof";
export type {
  PaymentPlan,
  PaymentPlanWithCycles,
  PaymentPlanType,
  PaymentPlanStatus,
} from "./domain/PaymentPlan";
export type {
  BillingCycle,
  BillingCycleWithProofs,
  BillingCycleWithPlan,
  BillingCycleStatus,
} from "./domain/BillingCycle";
export type { ContractFile } from "./domain/ContractFile";
