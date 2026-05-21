import { Role } from "@/types/auth";
import type {
  PaymentProof,
  PaymentProofWithCustomer,
} from "../../domain/PaymentProof";
import type { PaymentListQuery } from "../../schemas";

export interface PaymentListFilter extends PaymentListQuery {
  scopedTo: { role: Role; userId: string };
}

export interface PaymentRepository {
  createProof(
    customerInternalId: string,
    publicUrl: string,
  ): Promise<PaymentProof>;
  list(filter: PaymentListFilter): Promise<PaymentProofWithCustomer[]>;
}
