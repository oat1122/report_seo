import { PrismaUserRepository } from "./infrastructure/PrismaUserRepository";
import { BcryptPasswordHasher } from "./infrastructure/BcryptPasswordHasher";
import { listUsersUseCase } from "./application/use-cases/listUsers";
import { getUserByIdUseCase } from "./application/use-cases/getUserById";
import { listSeoDevsUseCase } from "./application/use-cases/listSeoDevs";
import { listManagedCustomersUseCase } from "./application/use-cases/listManagedCustomers";
import { createUserUseCase } from "./application/use-cases/createUser";
import { updateUserUseCase } from "./application/use-cases/updateUser";
import { softDeleteUserUseCase } from "./application/use-cases/softDeleteUser";
import { restoreUserUseCase } from "./application/use-cases/restoreUser";
import { changePasswordUseCase } from "./application/use-cases/changePassword";

const repo = new PrismaUserRepository();
const hasher = new BcryptPasswordHasher();

export const listUsers = listUsersUseCase(repo);
export const getUserById = getUserByIdUseCase(repo);
export const listSeoDevs = listSeoDevsUseCase(repo);
export const listManagedCustomers = listManagedCustomersUseCase(repo);
export const createUser = createUserUseCase(repo, hasher);
export const updateUser = updateUserUseCase(repo);
export const softDeleteUser = softDeleteUserUseCase(repo);
export const restoreUser = restoreUserUseCase(repo);
export const changePassword = changePasswordUseCase(repo, hasher);

export {
  userCreateSchema,
  userUpdateSchema,
  userSelfUpdateSchema,
  type UserCreateInput,
  type UserUpdateInput,
  type UserSelfUpdateInput,
} from "./schemas";
export type { User, CustomerProfile, Role } from "./domain/User";
