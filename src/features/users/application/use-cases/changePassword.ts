import { BadRequestError, NotFoundError } from "@/lib/errors";
import type { UserRepository } from "../ports/UserRepository";
import type { PasswordHasher } from "../ports/PasswordHasher";

export function changePasswordUseCase(
  repo: UserRepository,
  hasher: PasswordHasher,
) {
  return async (
    id: string,
    currentPassword: string | undefined,
    newPassword: string,
    isAdmin: boolean,
  ) => {
    const target = await repo.findPasswordById(id);
    if (!target) {
      throw new NotFoundError("User not found");
    }

    if (!isAdmin) {
      if (!currentPassword || !target.password) {
        throw new BadRequestError("Current password is required");
      }
      const valid = await hasher.verify(currentPassword, target.password);
      if (!valid) {
        throw new BadRequestError("Invalid current password");
      }
    }

    const hashedNewPassword = await hasher.hash(newPassword);
    await repo.updatePassword(id, hashedNewPassword);
  };
}
