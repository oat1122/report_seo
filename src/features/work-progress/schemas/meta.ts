import { z } from "zod";

export const metaValueTypeSchema = z
  .enum(["string", "number", "date", "json"])
  .default("string");

export const upsertMetaSchema = z.object({
  key: z
    .string()
    .min(1)
    .max(100)
    .regex(/^[a-zA-Z0-9_.-]+$/, "key ใช้ได้เฉพาะ a-z A-Z 0-9 _ . -"),
  value: z.string().max(10_000),
  valueType: metaValueTypeSchema,
});

export type UpsertMetaInput = z.infer<typeof upsertMetaSchema>;

export const metaKeyParamSchema = z.object({
  key: z
    .string()
    .min(1)
    .max(100)
    .regex(/^[a-zA-Z0-9_.-]+$/),
});
