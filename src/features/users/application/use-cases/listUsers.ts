import type { UserRepository } from '../ports/UserRepository'

export function listUsersUseCase(repo: UserRepository) {
  return (includeDeleted: boolean) => repo.findAll({ includeDeleted, includeAdminFields: true })
}
