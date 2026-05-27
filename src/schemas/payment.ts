import { z } from "zod";
import { PaymentStatus } from "@/types/payment";

export const paymentUploadSchema = z.object({
  customerId: z.uuid("customerId ต้องเป็น UUID"),
  billingCycleId: z.uuid().optional(),
});

export type PaymentUploadInput = z.infer<typeof paymentUploadSchema>;

export const paymentListQuerySchema = z.object({
  status: z.enum(PaymentStatus).optional(),
  customerId: z.uuid().optional(),
});

export type PaymentListQuery = z.infer<typeof paymentListQuerySchema>;

// --- Payment Plan ---

export const createPaymentPlanSchema = z
  .object({
    type: z.enum(["MONTHLY", "INSTALLMENT"]),
    amount: z.number().positive(),
    description: z.string().min(1).max(500),
    billingDay: z.number().int().min(1).max(31).optional().nullable(),
    totalInstallments: z.number().int().min(1).max(120).optional().nullable(),
    startDate: z.coerce.date(),
    endDate: z.coerce.date().optional().nullable(),
    note: z.string().max(2000).optional().nullable(),
    documentTemplateId: z.string().uuid().optional().nullable(),
  })
  .refine((d) => d.type !== "MONTHLY" || d.billingDay != null, {
    message: "billingDay จำเป็นสำหรับแผน MONTHLY",
    path: ["billingDay"],
  })
  .refine((d) => d.type !== "INSTALLMENT" || d.totalInstallments != null, {
    message: "totalInstallments จำเป็นสำหรับแผน INSTALLMENT",
    path: ["totalInstallments"],
  });

export type CreatePaymentPlanInput = z.infer<typeof createPaymentPlanSchema>;

export const updatePaymentPlanSchema = z.object({
  description: z.string().min(1).max(500).optional(),
  amount: z.number().positive().optional(),
  billingDay: z.number().int().min(1).max(31).optional().nullable(),
  totalInstallments: z.number().int().min(1).max(120).optional().nullable(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional().nullable(),
  note: z.string().max(2000).optional().nullable(),
  documentTemplateId: z.string().uuid().optional().nullable(),
});

export type UpdatePaymentPlanInput = z.infer<typeof updatePaymentPlanSchema>;

export const listPaymentPlansQuerySchema = z.object({
  status: z.enum(["ACTIVE", "COMPLETED", "CANCELLED"]).optional(),
});

export type ListPaymentPlansQuery = z.infer<typeof listPaymentPlansQuerySchema>;

// --- Billing Cycle ---

export const updateBillingCycleSchema = z.object({
  status: z.enum(["PENDING", "REVIEWING", "PAID", "OVERDUE", "CANCELLED"]),
  paidDate: z.coerce.date().optional().nullable(),
  note: z.string().max(2000).optional().nullable(),
});

export type UpdateBillingCycleInput = z.infer<typeof updateBillingCycleSchema>;

export const listBillingCyclesQuerySchema = z.object({
  planId: z.uuid().optional(),
});

export type ListBillingCyclesQuery = z.infer<typeof listBillingCyclesQuerySchema>;

// --- Payment Proof Status ---

export const updateProofStatusSchema = z.object({
  status: z.enum(["APPROVED", "REJECTED"]),
});

export type UpdateProofStatusInput = z.infer<typeof updateProofStatusSchema>;
