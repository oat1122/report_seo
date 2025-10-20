// src/types/user.ts
import { Role } from "./auth";

// Add a new interface for the customer profile structure
export interface CustomerProfile {
  name?: string;
  domain?: string;
  seoDevId?: string | null;
}

export interface User {
  id: string;
  name: string | null;
  email: string;
  role: Role;
  createdAt: string;
  deletedAt?: string | null;
  // Add the customerProfile to the User type
  customerProfile?: CustomerProfile | null;
}

export interface UserFormState extends Partial<User> {
  password?: string;
  currentPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
  companyName?: string;
  domain?: string;
  seoDevId?: string | null;
}
