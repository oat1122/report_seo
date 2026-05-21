import type { SessionUser } from "../../domain/AccessContext";

export interface SessionGateway {
  getCurrentUser(): Promise<SessionUser | null>;
}
