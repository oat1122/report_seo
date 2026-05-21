import pino, { type Logger, type LoggerOptions } from "pino";

const isProduction = process.env.NODE_ENV === "production";

const baseOptions: LoggerOptions = {
  level: process.env.LOG_LEVEL ?? (isProduction ? "info" : "debug"),
  base: { env: process.env.NODE_ENV ?? "development" },
  redact: {
    paths: [
      "*.password",
      "*.token",
      "*.authorization",
      "*.cookie",
      "*.email",
      "*.uploadUrl",
      "req.headers.cookie",
      "req.headers.authorization",
      "headers.cookie",
      "headers.authorization",
    ],
    remove: false,
  },
};

export const logger: Logger = isProduction
  ? pino(baseOptions)
  : pino({
      ...baseOptions,
      transport: {
        target: "pino-pretty",
        options: { colorize: true, translateTime: "SYS:HH:MM:ss.l", ignore: "pid,hostname" },
      },
    });

function readRequestId(req: Request): string {
  const headerId = req.headers.get("x-request-id");
  if (headerId && headerId.length > 0) return headerId;
  return crypto.randomUUID();
}

export function requestLogger(req: Request): Logger {
  const url = new URL(req.url);
  return logger.child({
    requestId: readRequestId(req),
    method: req.method,
    path: url.pathname,
  });
}

export type { Logger };
