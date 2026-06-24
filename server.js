/* eslint-disable @typescript-eslint/no-require-imports */
const express = require('express')
const next = require('next')
const { createServer } = require('http')
const { Server: SocketIOServer } = require('socket.io')
const { parse: parseCookie } = require('cookie')
const { decode } = require('next-auth/jwt')
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

  expressApp.all('*', (req, res) => {
    return handle(req, res)
  })

  httpServer.listen(port, () => {
    console.log(`> Ready on http://localhost:${port} (socket.io enabled)`)
  })
})
