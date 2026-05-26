import type { Server as SocketIOServer } from "socket.io";

declare global {
  // eslint-disable-next-line no-var
  var __socketIo: SocketIOServer | undefined;
}

export function getSocketServer(): SocketIOServer | null {
  return globalThis.__socketIo ?? null;
}
