import pino, { type Logger, type LoggerOptions } from 'pino'

const isProduction = process.env.NODE_ENV === 'production'

const REQUEST_ID_MAX_LENGTH = 128
// reject whitespace + control chars (log injection) — accept ทุก char ที่ trace header
// จาก infra ใช้จริง (Vercel `::`, AWS X-Ray `=;`, Cloud Run `/`, UUID/ULID)
const REQUEST_ID_PATTERN = /^[^\s\x00-\x1F\x7F]+$/

const SENSITIVE_KEYS = [
  'password',
  'passwordHash',
  'token',
  'sessionToken',
  'refreshToken',
  'authorization',
  'cookie',
  'email',
  'uploadUrl',
] as const

// fast-redact: `*` = single level เท่านั้น ไม่มี recursive `**`
// nested ลึกกว่า depth-2 ต้องระบุ path ตรง (เช่น req.body.password)
// คลุม `headers.*` ทั้งแบบมี/ไม่มี req prefix — กันโค้ดที่ log raw headers
const redactPaths = [
  ...SENSITIVE_KEYS,
  ...SENSITIVE_KEYS.map((k) => `*.${k}`),
  'req.body.password',
  'req.body.passwordHash',
  'req.body.email',
  'req.headers.cookie',
  'req.headers.authorization',
  'headers.cookie',
  'headers.authorization',
  '*.headers.cookie',
  '*.headers.authorization',
  'res.headers["set-cookie"]',
]

type PrismaLikeError = {
  code?: unknown
  meta?: unknown
  clientVersion?: unknown
}

const baseOptions: LoggerOptions = {
  level: process.env.LOG_LEVEL ?? (isProduction ? 'info' : 'debug'),
  base: {
    service: 'report-seo',
    env: process.env.NODE_ENV ?? 'development',
  },
  // pino ไม่ enable err serializer ให้เอง — Error มี message/stack เป็น non-enumerable
  // ถ้าไม่ใส่ตัวนี้ log.error({ err }) จะกลายเป็น {} ทำให้ stack หาย
  // ขยาย default ด้วย Prisma fields ที่ http.ts ปล่อย fall through มาเป็น 500
  serializers: {
    err: (error: unknown) => {
      const base = pino.stdSerializers.err(error as Error)
      const e = error as PrismaLikeError
      return {
        ...base,
        ...(e?.code !== undefined && { code: e.code }),
        ...(e?.meta !== undefined && { meta: e.meta }),
        ...(e?.clientVersion !== undefined && { clientVersion: e.clientVersion }),
      }
    },
  },
  redact: {
    paths: redactPaths,
    remove: false,
  },
}

const transport = isProduction
  ? undefined
  : {
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'SYS:HH:MM:ss.l',
        ignore: 'pid,hostname',
      },
    }

export const logger: Logger = pino({ ...baseOptions, transport })

function readRequestId(req: Request): string {
  const headerId = req.headers.get('x-request-id')
  if (
    headerId &&
    headerId.length > 0 &&
    headerId.length <= REQUEST_ID_MAX_LENGTH &&
    REQUEST_ID_PATTERN.test(headerId)
  ) {
    return headerId
  }
  return crypto.randomUUID()
}

export function requestLogger(req: Request): Logger {
  const url = new URL(req.url)
  return logger.child({
    requestId: readRequestId(req),
    method: req.method,
    path: url.pathname,
  })
}

export type { Logger }
