import type { User } from "../../domain/User";
import type {
  UserCreateInput,
  UserUpdateInput,
} from "../../schemas";

export interface UserRepository {
  findAll(options: {
    includeDeleted: boolean;
    includeAdminFields: boolean;
  }): Promise<User[]>;

  findById(
    id: string,
    options: { includeAdminFields: boolean },
  ): Promise<User | null>;

  findSeoDevs(): Promise<User[]>;

  findManagedCustomers(seoDevId: string): Promise<User[]>;

  findCustomerByDomain(
    domain: string,
    excludeUserId?: string,
  ): Promise<{ id: string; userId: string } | null>;

  createWithCustomerProfile(
    data: UserCreateInput & { hashedPassword: string },
  ): Promise<User | null>;

  createPlain(
    data: UserCreateInput & { hashedPassword: string },
  ): Promise<User>;

  applyUpdate(
    id: string,
    data: UserUpdateInput,
    options: { existingCustomerProfile: boolean },
  ): Promise<User>;

  softDelete(id: string): Promise<void>;

  /** ใช้ prismaBase bypass soft-delete filter */
  restoreSoftDeleted(id: string): Promise<{ deletedAt: Date | null }>;

  findIdAndDeletedAtIncludingDeleted(
    id: string,
  ): Promise<{ id: string; deletedAt: Date | null } | null>;

  findPasswordById(id: string): Promise<{ password: string | null } | null>;

  updatePassword(id: string, hashedPassword: string): Promise<void>;
}
