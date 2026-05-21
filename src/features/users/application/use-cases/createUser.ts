import { Role } from "@/types/auth";
import { ConflictError } from "@/lib/errors";
import type { UserRepository } from "../ports/UserRepository";
import type { PasswordHasher } from "../ports/PasswordHasher";
import type { UserCreateInput } from "../../schemas";

export function createUserUseCase(
  repo: UserRepository,
  hasher: PasswordHasher,
) {
  return async (data: UserCreateInput) => {
    const hashedPassword = await hasher.hash(data.password);

    if (data.role === Role.CUSTOMER) {
      if (!data.domain) {
        throw new ConflictError("Domain is required for CUSTOMER role");
      }
      const existing = await repo.findCustomerByDomain(data.domain);
      if (existing) {
        throw new ConflictError(
          `Domain "${data.domain}" is already registered to another customer.`,
        );
      }
      return repo.createWithCustomerProfile({ ...data, hashedPassword });
    }

    return repo.createPlain({ ...data, hashedPassword });
  };
}
