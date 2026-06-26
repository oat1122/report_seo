/* eslint-disable @typescript-eslint/no-require-imports */
const express = require('express')
const next = require('next')
const { createServer } = require('http')
const { Server: SocketIOServer } = require('socket.io')
const { parse: parseCookie } = require('cookie')
const { decode } = require('next-auth/jwt')
const fs = require('fs')
const path = require('path')
/* eslint-enable @typescript-eslint/no-require-imports */

const port = parseInt(process.env.PORT, 10) || 3000
const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev })
const handle = app.getRequestHandler()

// Diagnostic: prod process กำลัง restart วน (~ทุก 1–2 นาที) → weekly cron ไม่เคย fire
// log สาเหตุการตายแต่ละรอบ + memory ตอนตาย แยกให้ออกว่า PM2 kill (memory/watch)
// หรือ app crash (uncaught/unhandled). ดูใน `pm2 logs` ว่า "kind" เป็นอะไร
const logFatal = (kind, extra) => {
  const mem = process.memoryUsage()
  console.error(
    JSON.stringify({
      level: 'fatal',
      service: 'report-seo-server',
      kind,
      rssMB: Math.round(mem.rss / 1024 / 1024),
      heapUsedMB: Math.round(mem.heapUsed / 1024 / 1024),
      uptimeSec: Math.round(process.uptime()),
      ...extra,
    }),
  )
}

process.on('uncaughtException', (err) => {
  logFatal('uncaughtException', { err: (err && err.stack) || String(err) })
  // ponytail: exit เฉพาะ prod (PM2 restart). dev รัน server.js เหมือนกันแล้ว — อย่าฆ่า dev server
  if (!dev) process.exit(1)
})
process.on('unhandledRejection', (reason) => {
  logFatal('unhandledRejection', {
    reason: reason instanceof Error ? reason.stack : String(reason),
  })
  if (!dev) process.exit(1)
})
// PM2 ส่ง SIGINT/SIGTERM ก่อน kill (รวมถึงตอน max_memory_restart) — rssMB ตอนนี้บอกได้ว่าชน limit ไหม
for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => {
    logFatal('signal', { signal })
    process.exit(0)
  })
}

// Access log: ใคร / ทำอะไร / เมื่อไหร่ / หน้าไหน / IP — แบบอ่านง่าย เก็บแยกรายวันใน
// server/logs/access-DD-MM-YYYY.log แยกจาก pino JSON (log-*.log) เพราะ requirement = "อ่านง่าย"
// identity ใช้ userId+role ตามกฏ 01-security (ห้าม log email/PII เต็ม)
const ACCESS_LOG_DIR = path.join(__dirname, 'server', 'logs')
fs.mkdirSync(ACCESS_LOG_DIR, { recursive: true })

// log เฉพาะหน้าเพจ + API ที่ผู้ใช้เรียกจริง — ข้าม asset/_next/favicon และ /api/socket (long-poll noise)
const SKIP_ACCESS_LOG =
  /^\/(?:_next|favicon|static|api\/socket)\b|\.(?:js|css|map|ico|png|jpe?g|gif|svg|webp|woff2?|ttf)$/i

const pad2 = (n) => String(n).padStart(2, '0')

const accessLogPath = () => {
  const d = new Date()
  return path.join(
    ACCESS_LOG_DIR,
    `access-${pad2(d.getDate())}-${pad2(d.getMonth() + 1)}-${d.getFullYear()}.log`,
  )
}

const stamp = (d) =>
  `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())} ` +
  `${pad2(d.getHours())}:${pad2(d.getMinutes())}:${pad2(d.getSeconds())}`

// prod อยู่หลัง proxy (PM2) → remoteAddress = 127.0.0.1, ต้องอ่าน x-forwarded-for ก่อน
const clientIp = (req) => {
  const xff = req.headers['x-forwarded-for']
  if (typeof xff === 'string' && xff.length > 0) return xff.split(',')[0].trim()
  return req.headers['x-real-ip'] || req.socket?.remoteAddress || '-'
}

// decode session cookie best-effort — reuse logic เดียวกับ socket auth; ไม่มี/พัง = anonymous
const identifyUser = async (req) => {
  try {
    const cookieHeader = req.headers.cookie
    if (!cookieHeader) return 'anonymous'
    const cookies = parseCookie(cookieHeader)
    const token = cookies['next-auth.session-token'] || cookies['__Secure-next-auth.session-token']
    if (!token) return 'anonymous'
    const decoded = await decode({ token, secret: process.env.NEXTAUTH_SECRET })
    if (!decoded || !decoded.id) return 'anonymous'
    return `${decoded.id} (${decoded.role || '-'})`
  } catch {
    return 'anonymous'
  }
}

// ponytail: fire-and-forget — append error ถูกกลืน ห้ามให้ log line ทำ request พัง;
// ordering เป็น best-effort (async decode+append) พอสำหรับ audit log, มี timestamp กำกับทุกบรรทัด
const writeAccessLog = (req) => {
  const urlPath = (req.url || '/').split('?')[0]
  if (SKIP_ACCESS_LOG.test(urlPath)) return
  const ip = clientIp(req)
  const method = req.method
  identifyUser(req).then((who) => {
    const line = `${stamp(new Date())}  ${ip.padEnd(15)}  ${who.padEnd(38)}  ${method.padEnd(6)} ${urlPath}\n`
    fs.appendFile(accessLogPath(), line, () => {})
  })
}

app.prepare().then(() => {
  const expressApp = express()
  const httpServer = createServer(expressApp)

  const io = new SocketIOServer(httpServer, {
    path: '/api/socket',
    cors: {
      origin: process.env.NEXTAUTH_URL || `http://localhost:${port}`,
      credentials: true,
    },
    maxHttpBufferSize: 1e5,
  })

  // Store on globalThis so TS code can access via getSocketServer()
  globalThis.__socketIo = io

  // Auth middleware: verify NextAuth JWT from session cookie
  io.use(async (socket, next) => {
    try {
      const cookieHeader = socket.handshake.headers.cookie
      if (!cookieHeader) return next(new Error('No cookie'))

      const cookies = parseCookie(cookieHeader)
      const sessionToken =
        cookies['next-auth.session-token'] || cookies['__Secure-next-auth.session-token']

      if (!sessionToken) return next(new Error('No session token'))

      const decoded = await decode({
        token: sessionToken,
        secret: process.env.NEXTAUTH_SECRET,
      })

      if (!decoded || !decoded.id) return next(new Error('Invalid token'))

      socket.data.userId = decoded.id
      socket.data.role = decoded.role
      next()
    } catch {
      next(new Error('Authentication failed'))
    }
  })

  // Connection handler: join user-specific room
  io.on('connection', (socket) => {
    const userId = socket.data.userId
    socket.join(`user:${userId}`)

    socket.on('disconnect', () => {
      // cleanup handled by socket.io
    })
  })

  expressApp.use((req, _res, expressNext) => {
    writeAccessLog(req)
    expressNext()
  })

  expressApp.all('*', (req, res) => {
    return handle(req, res)
  })

  httpServer.listen(port, () => {
    console.log(`> Ready on http://localhost:${port} (socket.io enabled)`)
  })
})
