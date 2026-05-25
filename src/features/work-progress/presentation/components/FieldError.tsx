import type { ZodError } from "zod";

export type FieldErrors = Record<string, string>;

export function parseFieldErrors(error: ZodError): FieldErrors {
  const result: FieldErrors = {};
  for (const issue of error.issues) {
    const key = issue.path[0]?.toString();
    if (key && !result[key]) result[key] = issue.message;
  }
  return result;
}

export function FieldError({ error }: { error?: string }) {
  if (!error) return null;
  return <p className="text-xs text-destructive">{error}</p>;
}
