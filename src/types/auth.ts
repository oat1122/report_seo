// Types for authentication and role-based access control

/**
 * User roles for role-based access control
 */
export enum Role {
  ADMIN = "ADMIN", // Super administrator
  SEO_DEV = "SEO_DEV", // SEO specialist
  CUSTOMER = "CUSTOMER", // Client or regular user
}

/**
 * Extended user interface including role
 */
export interface ExtendedUser {
  id: string;
  name?: string | null;
  email?: string | null;
  role: Role;
}

/**
 * Extended session interface including user role
 */
export interface ExtendedSession {
  user: ExtendedUser;
  expires: string;
}
