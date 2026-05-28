import type { UserRepository } from '../ports/UserRepository'

export function getUserByIdUseCase(repo: UserRepository) {
  return (id: string, options: { includeAdminFields: boolean } = { includeAdminFields: false }) =>
    repo.findById(id, options)
}
