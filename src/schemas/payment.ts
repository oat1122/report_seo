import { z } from "zod";
import { PaymentStatus } from "@/types/payment";

export const paymentUploadSchema = z.object({
  customerId: z.uuid("customerId ต้องเป็น UUID"),
});

export type PaymentUploadInput = z.infer<typeof paymentUploadSchema>;

export const paymentListQuerySchema = z.object({
  status: z.enum(PaymentStatus).optional(),
  customerId: z.uuid().optional(),
});

export type PaymentListQuery = z.infer<typeof paymentListQuerySchema>;
