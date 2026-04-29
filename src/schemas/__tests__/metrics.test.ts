import { describe, expect, it } from "vitest";
import { metricsSchema } from "@/schemas/metrics";

describe("metricsSchema", () => {
  it("accepts partial input (single field)", () => {
    const result = metricsSchema.safeParse({ domainRating: 12 });
    expect(result.success).toBe(true);
    expect(result.data).toEqual({ domainRating: 12 });
  });

  it("accepts empty object (all fields optional)", () => {
    const result = metricsSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it("coerces string numbers", () => {
    const result = metricsSchema.safeParse({ healthScore: "87" });
    expect(result.success).toBe(true);
    expect(result.data?.healthScore).toBe(87);
  });

  it("rejects out-of-range values", () => {
    const result = metricsSchema.safeParse({ domainRating: 150 });
    expect(result.success).toBe(false);
  });

  it("accepts decimal spamScore (e.g. 0.1)", () => {
    const result = metricsSchema.safeParse({ spamScore: 0.1 });
    expect(result.success).toBe(true);
    expect(result.data?.spamScore).toBe(0.1);
  });

  it("rejects decimal on integer fields (e.g. domainRating)", () => {
    const result = metricsSchema.safeParse({ domainRating: 12.5 });
    expect(result.success).toBe(false);
  });

  it("rejects negative values", () => {
    const result = metricsSchema.safeParse({ backlinks: -5 });
    expect(result.success).toBe(false);
  });

  it("accepts full payload", () => {
    const result = metricsSchema.safeParse({
      domainRating: 42,
      healthScore: 87,
      ageInYears: 2,
      ageInMonths: 6,
      spamScore: 1,
      organicTraffic: 1200,
      organicKeywords: 350,
      backlinks: 980,
      refDomains: 120,
    });
    expect(result.success).toBe(true);
  });
});
