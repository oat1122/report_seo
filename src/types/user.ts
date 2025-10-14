// src/types/user.ts
import { Role } from "./auth";

export interface User {
  id: string;
  name: string | null;
  email: string;
  role: Role;
  createdAt: string;
}

export interface UserFormState extends Partial<User> {
  password?: string;
  companyName?: string;
  domain?: string;
  seoDevId?: string | null;
}
