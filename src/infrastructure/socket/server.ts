import type { Server as SocketIOServer } from 'socket.io'

declare global {
  var __socketIo: SocketIOServer | undefined
}

export function getSocketServer(): SocketIOServer | null {
  return globalThis.__socketIo ?? null
}
