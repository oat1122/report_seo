import type { UserRepository } from '../ports/UserRepository'

export function listSeoDevsUseCase(repo: UserRepository) {
  return () => repo.findSeoDevs()
}
