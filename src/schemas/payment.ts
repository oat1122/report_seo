import { PaymentStatus } from "@prisma/client";
import { z } from "zod";

export const paymentUploadSchema = z.object({
  customerId: z.string().uuid("customerId ต้องเป็น UUID"),
});

export type PaymentUploadInput = z.infer<typeof paymentUploadSchema>;

export const paymentListQuerySchema = z.object({
  status: z.enum(PaymentStatus).optional(),
  customerId: z.string().uuid().optional(),
});

export type PaymentListQuery = z.infer<typeof paymentListQuerySchema>;
