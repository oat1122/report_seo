import type { UserRepository } from '../ports/UserRepository'

export function softDeleteUserUseCase(repo: UserRepository) {
  return (id: string) => repo.softDelete(id)
}
