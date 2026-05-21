import { PaymentStatus } from "@/types/payment";

export type { PaymentStatus };

export interface PaymentProof {
  id: string;
  customerId: string;
  uploadUrl: string;
  uploadDate: Date;
  status: PaymentStatus;
}

export interface PaymentProofWithCustomer extends PaymentProof {
  customer: {
    id: string;
    name: string;
    domain: string;
  };
}
