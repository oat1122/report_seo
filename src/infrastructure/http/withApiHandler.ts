import { NextResponse, type NextRequest } from "next/server";
import type { Session } from "next-auth";
import type { z, ZodTypeAny } from "zod";
import { toErrorResponse } from "@/lib/http";
import { requestLogger, type Logger } from "@/lib/logger";
import { requireRole, requireSession } from "@/infrastructure/auth/session";
import { Role } from "@/types/auth";
import { parseJsonBody, parseParams, parseQuery } from "./request";

export type RouteContext = { params: Promise<Record<string, string>> };

export type ApiHandlerOptions = {
  auth?: boolean;
  roles?: Role[];
  body?: ZodTypeAny;
  query?: ZodTypeAny;
  params?: ZodTypeAny;
};

type InferSchema<T, Fallback> = T extends ZodTypeAny ? z.infer<T> : Fallback;

export type HandlerContext<O extends ApiHandlerOptions> = {
  req: NextRequest;
  params: InferSchema<O["params"], Record<string, string>>;
  session: O extends { auth: false } ? Session | null : Session;
  body: InferSchema<O["body"], undefined>;
  query: InferSchema<O["query"], undefined>;
  logger: Logger;
};

export function withApiHandler<O extends ApiHandlerOptions>(
  options: O,
  handler: (ctx: HandlerContext<O>) => Promise<NextResponse> | NextResponse,
) {
  return async (req: NextRequest, route: RouteContext): Promise<NextResponse> => {
    const logger = requestLogger(req);
    try {
      const rawParams = (await route?.params) ?? {};
      const params = options.params
        ? parseParams(rawParams, options.params)
        : rawParams;

      let session: Session | null = null;
      if (options.auth !== false || options.roles) {
        session = options.roles
          ? await requireRole(options.roles)
          : await requireSession();
      }

      const query = options.query ? parseQuery(req, options.query) : undefined;
      const body = options.body ? await parseJsonBody(req, options.body) : undefined;

      const ctx = {
        req,
        params,
        session,
        body,
        query,
        logger,
      } as unknown as HandlerContext<O>;

      return await handler(ctx);
    } catch (error) {
      return toErrorResponse(error, logger);
    }
  };
}
