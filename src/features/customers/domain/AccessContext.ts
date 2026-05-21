import { Role } from "@/types/auth";
import type { Customer } from "./Customer";

export interface SessionUser {
  id: string;
  role: Role;
}

export class CustomerAccessContext {
  constructor(
    public readonly user: SessionUser,
    public readonly customer: Customer,
  ) {}

  get isAdmin(): boolean {
    return this.user.role === Role.ADMIN;
  }

  get isOwner(): boolean {
    return this.user.id === this.customer.userId;
  }

  get isAssignedSeoDev(): boolean {
    return (
      this.user.role === Role.SEO_DEV &&
      this.customer.seoDevId === this.user.id
    );
  }

  get canRead(): boolean {
    return this.isAdmin || this.isOwner || this.isAssignedSeoDev;
  }

  get canManage(): boolean {
    return this.isAdmin || this.isAssignedSeoDev;
  }
}
