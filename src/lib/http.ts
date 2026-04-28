import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { HttpError } from "@/lib/errors";

type PrismaKnownError = {
  code: string;
  meta?: { target?: string[] | string };
};

function isPrismaKnownError(error: unknown): error is PrismaKnownError {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    typeof (error as { code: unknown }).code === "string"
  );
}

export function toErrorResponse(error: unknown): NextResponse {
  if (error instanceof HttpError) {
    return NextResponse.json(
      { error: error.message },
      { status: error.status },
    );
  }

  if (error instanceof ZodError) {
    const message = error.issues
      .map((issue) => `${issue.path.join(".") || "(root)"}: ${issue.message}`)
      .join("; ");
    return NextResponse.json({ error: message }, { status: 400 });
  }

  if (isPrismaKnownError(error)) {
    if (error.code === "P2002") {
      const target = error.meta?.target;
      const field = Array.isArray(target) ? target.join(", ") : target;
      return NextResponse.json(
        {
          error: field
            ? `Duplicate value for: ${field}`
            : "Duplicate data found.",
        },
        { status: 409 },
      );
    }
    if (error.code === "P2025") {
      return NextResponse.json({ error: "Record not found" }, { status: 404 });
    }
  }

  console.error("Unhandled error in route handler:", error);
  return NextResponse.json(
    { error: "Internal Server Error" },
    { status: 500 },
  );
}
