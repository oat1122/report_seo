// NextAuth type extensions
import { Role } from "@/types/auth";

declare module "next-auth" {
  /**
   * Extending the default Session type to include user role
   */
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      role: Role;
    };
  }

  /**
   * Extending the default User type to include role
   */
  interface User {
    id: string;
    name?: string | null;
    email?: string | null;
    role: Role;
  }
}

declare module "next-auth/jwt" {
  /**
   * Extending the JWT type to include user role
   */
  interface JWT {
    id: string;
    role: Role;
  }
}
