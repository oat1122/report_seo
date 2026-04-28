import { describe, expect, it } from "vitest";
import {
  BadRequestError,
  ConflictError,
  ForbiddenError,
  HttpError,
  NotFoundError,
  UnauthorizedError,
  UnprocessableEntityError,
} from "@/lib/errors";

describe("HttpError hierarchy", () => {
  it("each subclass carries the expected status", () => {
    expect(new BadRequestError().status).toBe(400);
    expect(new UnauthorizedError().status).toBe(401);
    expect(new ForbiddenError().status).toBe(403);
    expect(new NotFoundError().status).toBe(404);
    expect(new ConflictError().status).toBe(409);
    expect(new UnprocessableEntityError().status).toBe(422);
  });

  it("preserves message", () => {
    const error = new ConflictError("Email already exists");
    expect(error.message).toBe("Email already exists");
    expect(error.name).toBe("ConflictError");
  });

  it("subclasses are instances of HttpError and Error", () => {
    const error = new NotFoundError();
    expect(error).toBeInstanceOf(HttpError);
    expect(error).toBeInstanceOf(Error);
  });

  it("custom HttpError accepts arbitrary status", () => {
    const error = new HttpError(418, "I'm a teapot");
    expect(error.status).toBe(418);
    expect(error.message).toBe("I'm a teapot");
  });
});
