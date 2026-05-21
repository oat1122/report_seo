import { Role } from "@/types/auth";

export type { Role };

export interface CustomerProfile {
  name: string;
  domain: string;
  seoDevId?: string | null;
}

export interface User {
  id: string;
  name: string | null;
  email: string;
  role: Role;
  createdAt: Date;
  deletedAt: Date | null;
  customerProfile: CustomerProfile | null;
}
