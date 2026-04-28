import { Role } from "@prisma/client";
import { z } from "zod";

export const userCreateSchema = z
  .object({
    name: z.string().trim().min(1, "Name is required"),
    email: z.string().email("Invalid email"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    role: z.enum(Role),
    companyName: z.string().trim().min(1).optional(),
    domain: z.string().trim().min(1).optional(),
    seoDevId: z.string().uuid().nullable().optional(),
  })
  .strict()
  .refine(
    (data) =>
      data.role !== Role.CUSTOMER ||
      (!!data.companyName && !!data.domain),
    {
      message: "Company Name and Domain are required for CUSTOMER role",
      path: ["companyName"],
    },
  )
  .refine(
    (data) => data.role !== Role.CUSTOMER || !!data.seoDevId,
    {
      message: "SEO Dev assignment is required for CUSTOMER role",
      path: ["seoDevId"],
    },
  );

export type UserCreateInput = z.infer<typeof userCreateSchema>;

// Update payload — admin only field set; CUSTOMER fields optional
export const userUpdateSchema = z
  .object({
    name: z.string().trim().min(1).optional(),
    email: z.string().email().optional(),
    role: z.enum(Role).optional(),
    companyName: z.string().trim().min(1).optional(),
    domain: z.string().trim().min(1).optional(),
    seoDevId: z.string().uuid().nullable().optional(),
  })
  .strict();

export type UserUpdateInput = z.infer<typeof userUpdateSchema>;

// CUSTOMER/SEO_DEV self-update — name + email เท่านั้น
export const userSelfUpdateSchema = z
  .object({
    name: z.string().trim().min(1).optional(),
    email: z.string().email().optional(),
  })
  .strict();

export type UserSelfUpdateInput = z.infer<typeof userSelfUpdateSchema>;
