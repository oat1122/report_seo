import { describe, expect, it } from "vitest";
import {
  userCreateSchema,
  userSelfUpdateSchema,
  userUpdateSchema,
} from "@/schemas/user";

describe("userCreateSchema", () => {
  it("accepts a valid SEO_DEV payload", () => {
    const result = userCreateSchema.safeParse({
      name: "Dev",
      email: "dev@example.com",
      password: "secret123",
      role: "SEO_DEV",
    });
    expect(result.success).toBe(true);
  });

  it("requires companyName + domain when role=CUSTOMER", () => {
    const result = userCreateSchema.safeParse({
      name: "X",
      email: "x@example.com",
      password: "secret123",
      role: "CUSTOMER",
    });
    expect(result.success).toBe(false);
  });

  it("requires seoDevId when role=CUSTOMER", () => {
    const result = userCreateSchema.safeParse({
      name: "X",
      email: "x@example.com",
      password: "secret123",
      role: "CUSTOMER",
      companyName: "Acme",
      domain: "acme.com",
    });
    expect(result.success).toBe(false);
  });

  it("accepts CUSTOMER with all required fields", () => {
    const result = userCreateSchema.safeParse({
      name: "X",
      email: "x@example.com",
      password: "secret123",
      role: "CUSTOMER",
      companyName: "Acme",
      domain: "acme.com",
      seoDevId: "550e8400-e29b-41d4-a716-446655440000",
    });
    expect(result.success).toBe(true);
  });

  it("rejects unknown fields", () => {
    const result = userCreateSchema.safeParse({
      name: "Dev",
      email: "dev@example.com",
      password: "secret123",
      role: "SEO_DEV",
      isSuperAdmin: true,
    });
    expect(result.success).toBe(false);
  });
});

describe("userUpdateSchema", () => {
  it("rejects password field (admin can't backdoor password update)", () => {
    const result = userUpdateSchema.safeParse({
      name: "Dev",
      password: "newsecret",
    });
    expect(result.success).toBe(false);
  });

  it("accepts partial updates", () => {
    const result = userUpdateSchema.safeParse({ name: "New Name" });
    expect(result.success).toBe(true);
  });
});

describe("userSelfUpdateSchema", () => {
  it("rejects role/companyName/seoDevId fields", () => {
    const result = userSelfUpdateSchema.safeParse({
      name: "Me",
      role: "ADMIN",
    });
    expect(result.success).toBe(false);
  });

  it("accepts name + email only", () => {
    const result = userSelfUpdateSchema.safeParse({
      name: "Me",
      email: "me@example.com",
    });
    expect(result.success).toBe(true);
  });
});
